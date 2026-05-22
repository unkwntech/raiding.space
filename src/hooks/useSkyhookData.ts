import { useEffect, useRef, useState } from 'react';
import { fetchRaidableSkyhooks } from '../api/skyhooks';
import { fetchConstellation, fetchRegion, fetchSystem } from '../api/esi';
import { RaidableByRegion, ResolvedSkyhook } from '../types/app';

const FALLBACK_INTERVAL_MS = 5 * 60 * 1000;

interface SkyhookDataResult {
  resolvedSkyhooks: ResolvedSkyhook[];
  raidableByRegion: RaidableByRegion;
  regionNames: Map<number, string>;
  nextRefreshAt: number;
  isLoading: boolean;
  error: Error | null;
}

export function useSkyhookData(): SkyhookDataResult {
  const [resolvedSkyhooks, setResolvedSkyhooks] = useState<ResolvedSkyhook[]>([]);
  const [raidableByRegion, setRaidableByRegion] = useState<RaidableByRegion>(new Map());
  const [regionNames, setRegionNames] = useState<Map<number, string>>(new Map());
  const [nextRefreshAt, setNextRefreshAt] = useState<number>(Date.now() + FALLBACK_INTERVAL_MS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolve(): Promise<void> {
      try {
        const { data: { skyhooks }, expiresAt } = await fetchRaidableSkyhooks();

        const uniqueSystemIds = [...new Set(skyhooks.map((s) => s.solar_system_id))];
        const systems = await Promise.all(uniqueSystemIds.map(fetchSystem));
        const systemMap = new Map(systems.map((s) => [s.system_id, s]));

        const uniqueConstellationIds = [...new Set(systems.map((s) => s.constellation_id))];
        const constellations = await Promise.all(uniqueConstellationIds.map(fetchConstellation));
        const constellationMap = new Map(constellations.map((c) => [c.constellation_id, c]));

        const uniqueRegionIds = [...new Set(constellations.map((c) => c.region_id))];
        const regions = await Promise.all(uniqueRegionIds.map(fetchRegion));
        const regionMap = new Map(regions.map((r) => [r.region_id, r]));

        if (cancelled) return;

        const resolved: ResolvedSkyhook[] = [];
        const byRegion: RaidableByRegion = new Map();

        for (const skyhook of skyhooks) {
          const system = systemMap.get(skyhook.solar_system_id);
          if (!system) continue;
          const constellation = constellationMap.get(system.constellation_id);
          if (!constellation) continue;
          const region = regionMap.get(constellation.region_id);
          if (!region) continue;

          resolved.push({
            ...skyhook,
            system_name: system.name,
            region_id: region.region_id,
            region_name: region.name,
          });

          const existing = byRegion.get(region.region_id) ?? new Set<number>();
          existing.add(skyhook.solar_system_id);
          byRegion.set(region.region_id, existing);
        }

        setResolvedSkyhooks(resolved);
        setRaidableByRegion(byRegion);
        setRegionNames(new Map(regions.map((r) => [r.region_id, r.name])));

        // Schedule next refresh at the cache expiry time from the response header
        const delay = Math.max(expiresAt - Date.now(), 10_000);
        setNextRefreshAt(Date.now() + delay);
        if (intervalRef.current !== null) clearTimeout(intervalRef.current);
        intervalRef.current = setTimeout(() => { void resolve(); }, delay);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          // On error, retry after the fallback interval
          if (intervalRef.current !== null) clearTimeout(intervalRef.current);
          intervalRef.current = setTimeout(() => { void resolve(); }, FALLBACK_INTERVAL_MS);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void resolve();
    return () => {
      cancelled = true;
      if (intervalRef.current !== null) clearTimeout(intervalRef.current);
    };
  }, []);

  return { resolvedSkyhooks, raidableByRegion, regionNames, nextRefreshAt, isLoading, error };
}
