import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchRegion } from './api/esi';
import { useSkyhookData } from './hooks/useSkyhookData';
import { AppView, RegionGlowSets } from './types/app';
import { computeRegionGlowSets, computeSystemGlowSets } from './utils/regionGlow';
import { regionNameFromSlug, regionNameToUrl } from './utils/regionNameToUrl';
import { ErrorBanner } from './components/ErrorBanner/ErrorBanner';
import { LoadingSpinner } from './components/LoadingSpinner/LoadingSpinner';
import { RefreshCountdown } from './components/RefreshCountdown/RefreshCountdown';
import { RegionMap } from './components/RegionMap/RegionMap';
import { SkyhookList } from './components/SkyhookList/SkyhookList';
import { UniverseMap } from './components/UniverseMap/UniverseMap';
import './App.css';

function viewFromHash(): AppView {
  const slug = window.location.hash.slice(1);
  if (slug) {
    return { kind: 'region', regionId: 0, regionName: regionNameFromSlug(slug) };
  }
  return { kind: 'universe' };
}

export function App(): React.ReactElement {
  const [view, setView] = useState<AppView>(viewFromHash);
  const [flashSystemId, setFlashSystemId] = useState<number | null>(null);
  const { resolvedSkyhooks, raidableByRegion, regionNames, nextRefreshAt, isLoading, error } = useSkyhookData();

  // Sync regionId once ESI data is available for hash-initialised region views
  useEffect(() => {
    if (view.kind !== 'region' || view.regionId !== 0) return;
    const match = [...regionNames.entries()].find(
      ([, name]) => regionNameToUrl(name) === regionNameToUrl(view.regionName)
    );
    if (match) setView({ kind: 'region', regionId: match[0], regionName: match[1] });
  }, [view, regionNames]);

  // Update hash when view changes
  useEffect(() => {
    const slug = view.kind === 'region' ? regionNameToUrl(view.regionName) : '';
    if (window.location.hash !== `#${slug}`) {
      window.history.pushState(null, '', slug ? `#${slug}` : window.location.pathname);
    }
  }, [view]);

  // Handle browser back/forward
  useEffect(() => {
    function onPopState(): void {
      setView(viewFromHash());
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Recompute glow sets every minute so open/expiring/upcoming states stay current
  const [tick, setTick] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    tickRef.current = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  const regionGlowSets = useMemo<RegionGlowSets>(
    () => computeRegionGlowSets(resolvedSkyhooks),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resolvedSkyhooks, tick],
  );

  const activeRegionId = view.kind === 'region' ? view.regionId : null;
  const systemGlowSets = useMemo<RegionGlowSets>(
    () => activeRegionId !== null
      ? computeSystemGlowSets(resolvedSkyhooks, activeRegionId)
      : { green: new Set(), red: new Set(), white: new Set() },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resolvedSkyhooks, activeRegionId, tick],
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorBanner error={error} />;

  const raidableRegionIds = new Set(raidableByRegion.keys());

  async function handleRegionClick(regionId: number): Promise<void> {
    const name = regionNames.get(regionId) ?? (await fetchRegion(regionId)).name;
    setView({ kind: 'region', regionId, regionName: name });
  }

  function handleBackClick(): void {
    setView({ kind: 'universe' });
  }

  if (view.kind === 'region') {
    const systemIds = raidableByRegion.get(view.regionId) ?? new Set<number>();
    return (
      <div className="app-layout">
        <RefreshCountdown nextRefreshAt={nextRefreshAt} />
        <div className="app-map-panel">
          <button className="back-button" onClick={handleBackClick}>
            ← Universe
          </button>
          <h2 className="region-title">{view.regionName}</h2>
          <RegionMap regionName={view.regionName} raidableSystemIds={systemIds} glowSets={systemGlowSets} flashSystemId={flashSystemId} onFlashComplete={() => setFlashSystemId(null)} />
        </div>
        <aside className="app-sidebar">
          <SkyhookList items={resolvedSkyhooks} activeRegionId={view.regionId} onSystemClick={setFlashSystemId} />
        </aside>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <RefreshCountdown nextRefreshAt={nextRefreshAt} />
      <div className="app-map-panel">
        <h1 className="app-title">raiding.space</h1>
        <UniverseMap
          raidableRegionIds={raidableRegionIds}
          glowSets={regionGlowSets}
          onRegionClick={handleRegionClick}
        />
      </div>
      <aside className="app-sidebar">
        <SkyhookList items={resolvedSkyhooks} onRegionClick={handleRegionClick} />
      </aside>
    </div>
  );
}
