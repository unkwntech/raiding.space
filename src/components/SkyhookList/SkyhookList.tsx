import React from 'react';
import { ResolvedSkyhook } from '../../types/app';
import { SkyhookListItem } from '../SkyhookListItem/SkyhookListItem';
import './SkyhookList.css';

interface SkyhookListProps {
  items: ResolvedSkyhook[];
  activeRegionId?: number;
  onRegionClick?: (regionId: number) => void;
  onSystemClick?: (systemId: number) => void;
}

export function SkyhookList({ items, activeRegionId, onRegionClick, onSystemClick }: SkyhookListProps): React.ReactElement {
  const filtered = activeRegionId !== undefined
    ? items.filter((s) => s.region_id === activeRegionId)
    : items;

  if (filtered.length === 0) {
    return <div className="skyhook-list-empty">No raidable skyhooks found.</div>;
  }

  if (activeRegionId !== undefined) {
    return (
      <ul className="skyhook-list">
        {filtered.map((s) => (
          <SkyhookListItem key={`${s.solar_system_id}-${s.planet_id}`} skyhook={s} onSystemClick={onSystemClick} />
        ))}
      </ul>
    );
  }

  const byRegion = new Map<number, ResolvedSkyhook[]>();
  for (const s of filtered) {
    const existing = byRegion.get(s.region_id) ?? [];
    existing.push(s);
    byRegion.set(s.region_id, existing);
  }

  return (
    <div className="skyhook-list-grouped">
      {[...byRegion.entries()].map(([regionId, skyhooks]) => (
        <div key={regionId} className="skyhook-region-group">
          <button
            className="skyhook-region-heading"
            onClick={() => onRegionClick?.(regionId)}
          >
            {skyhooks[0].region_name}
            <span className="skyhook-region-count">{skyhooks.length}</span>
          </button>
          <ul className="skyhook-list">
            {skyhooks.map((s) => (
              <SkyhookListItem key={`${s.solar_system_id}-${s.planet_id}`} skyhook={s} onSystemClick={onSystemClick} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
