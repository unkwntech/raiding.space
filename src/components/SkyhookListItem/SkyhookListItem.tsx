import React, { useState } from 'react';
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
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent): void {
    e.stopPropagation();
    void navigator.clipboard.writeText(skyhook.system_name).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <li className="skyhook-item">
      <div className="skyhook-item-name-row">
        <div
          className={`skyhook-item-name${onSystemClick ? ' skyhook-item-name--clickable' : ''}`}
          onClick={() => onSystemClick?.(skyhook.solar_system_id)}
        >{skyhook.system_name}</div>
        <button className="skyhook-item-copy" onClick={handleCopy} title="Copy system name">
          {copied
            ? <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><polyline points="2,8 6,12 14,4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            : <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="1" width="9" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M3 5H2a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          }
        </button>
      </div>
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
