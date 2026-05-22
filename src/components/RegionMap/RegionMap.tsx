import React from 'react';
import { RegionGlowSets } from '../../types/app';
import { regionNameToUrl } from '../../utils/regionNameToUrl';
import { SvgMapRenderer } from '../SvgMapRenderer/SvgMapRenderer';

interface RegionMapProps {
  regionName: string;
  raidableSystemIds: ReadonlySet<number>;
  glowSets: RegionGlowSets;
  flashSystemId?: number | null;
  onFlashComplete?: () => void;
}

export function RegionMap({ regionName, raidableSystemIds, glowSets, flashSystemId, onFlashComplete }: RegionMapProps): React.ReactElement {
  const svgPath = `/maps/${regionNameToUrl(regionName)}.dark.svg`;
  return (
    <SvgMapRenderer
      svgPath={svgPath}
      highlightIds={raidableSystemIds}
      glowSets={glowSets}
      flashSystemId={flashSystemId}
      onFlashComplete={onFlashComplete}
      onElementClick={() => undefined}
    />
  );
}
