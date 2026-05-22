import { ResolvedSkyhook, RegionGlowSets } from '../types/app';
import { RaidableSkyhook } from '../types/skyhook';

const SOON_MS = 30 * 60 * 1000;
const EXPIRING_MS = 5 * 60 * 1000;

export function computeRegionGlowSets(skyhooks: ResolvedSkyhook[]): RegionGlowSets {
  const now = Date.now();

  // Group skyhooks by region
  const byRegion = new Map<number, ResolvedSkyhook[]>();
  for (const s of skyhooks) {
    const list = byRegion.get(s.region_id) ?? [];
    list.push(s);
    byRegion.set(s.region_id, list);
  }

  const green = new Set<number>();
  const red = new Set<number>();
  const white = new Set<number>();

  for (const [regionId, regionSkyhooks] of byRegion) {
    const openSkyhooks = regionSkyhooks.filter((s) => {
      const start = new Date(s.theft_vulnerability.start).getTime();
      const end = new Date(s.theft_vulnerability.end).getTime();
      return now >= start && now < end;
    });

    const soonSkyhooks = regionSkyhooks.filter((s) => {
      const start = new Date(s.theft_vulnerability.start).getTime();
      return start > now && start - now <= SOON_MS;
    });

    if (openSkyhooks.length > 0) {
      const allExpiringSoon = openSkyhooks.every((s) => {
        const end = new Date(s.theft_vulnerability.end).getTime();
        return end - now <= EXPIRING_MS;
      });
      if (allExpiringSoon && soonSkyhooks.length === 0) {
        red.add(regionId);
      } else {
        green.add(regionId);
      }
    } else if (soonSkyhooks.length > 0) {
      white.add(regionId);
    }
  }

  return { green, red, white };
}

// skyhooks here is the full list; regionId filters to only systems in that region.
// raidableByRegion is used to know which system IDs are relevant.
export function computeSystemGlowSets(
  skyhooks: ResolvedSkyhook[],
  regionId: number,
): RegionGlowSets {
  const now = Date.now();
  const green = new Set<number>();
  const red = new Set<number>();
  const white = new Set<number>();

  const regionSkyhooks = skyhooks.filter((s) => s.region_id === regionId);

  // Group by system — a system may have multiple skyhooks (one per planet)
  const bySystem = new Map<number, RaidableSkyhook[]>();
  for (const s of regionSkyhooks) {
    const list = bySystem.get(s.solar_system_id) ?? [];
    list.push(s);
    bySystem.set(s.solar_system_id, list);
  }

  for (const [systemId, systemSkyhooks] of bySystem) {
    const openSkyhooks = systemSkyhooks.filter((s) => {
      const start = new Date(s.theft_vulnerability.start).getTime();
      const end = new Date(s.theft_vulnerability.end).getTime();
      return now >= start && now < end;
    });

    const soonSkyhooks = systemSkyhooks.filter((s) => {
      const start = new Date(s.theft_vulnerability.start).getTime();
      return start > now && start - now <= SOON_MS;
    });

    if (openSkyhooks.length > 0) {
      const anyExpiringWithin5 = openSkyhooks.some((s) => {
        const end = new Date(s.theft_vulnerability.end).getTime();
        return end - now <= EXPIRING_MS;
      });
      if (anyExpiringWithin5) {
        red.add(systemId);
      } else {
        green.add(systemId);
      }
    } else if (soonSkyhooks.length > 0) {
      white.add(systemId);
    }
  }

  return { green, red, white };
}
