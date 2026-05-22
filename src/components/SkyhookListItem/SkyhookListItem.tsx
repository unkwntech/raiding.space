import React from 'react';
import { ResolvedSkyhook } from '../../types/app';
import { VulnerabilityTimer } from '../VulnerabilityTimer/VulnerabilityTimer';
import './SkyhookListItem.css';

interface SkyhookListItemProps {
  skyhook: ResolvedSkyhook;
  showRegion?: boolean;
  onRegionClick?: (regionId: number) => void;
  onSystemClick?: (systemId: number) => void;
}

export function SkyhookListItem({ skyhook, showRegion, onRegionClick, onSystemClick }: SkyhookListItemProps): React.ReactElement {
  return (
    <li className="skyhook-item">
      <div
        className={`skyhook-item-name${onSystemClick ? ' skyhook-item-name--clickable' : ''}`}
        onClick={() => onSystemClick?.(skyhook.solar_system_id)}
      >{skyhook.system_name}</div>
      {showRegion && onRegionClick && (
        <button
          className="skyhook-item-region"
          onClick={() => onRegionClick(skyhook.region_id)}
        >
          {skyhook.region_name}
        </button>
      )}
      <VulnerabilityTimer
        start={skyhook.theft_vulnerability.start}
        end={skyhook.theft_vulnerability.end}
      />
    </li>
  );
}
