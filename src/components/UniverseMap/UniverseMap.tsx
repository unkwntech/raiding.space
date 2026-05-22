import React from 'react';
import { RegionGlowSets } from '../../types/app';
import { SvgMapRenderer } from '../SvgMapRenderer/SvgMapRenderer';

interface UniverseMapProps {
  raidableRegionIds: ReadonlySet<number>;
  glowSets: RegionGlowSets;
  onRegionClick: (regionId: number) => void;
}

export function UniverseMap({ raidableRegionIds, glowSets, onRegionClick }: UniverseMapProps): React.ReactElement {
  return (
    <SvgMapRenderer
      svgPath="/maps/New_Eden.dark.svg"
      highlightIds={raidableRegionIds}
      glowSets={glowSets}
      onElementClick={onRegionClick}
    />
  );
}
