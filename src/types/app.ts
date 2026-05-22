import { RaidableSkyhook } from './skyhook';

export interface ResolvedSkyhook extends RaidableSkyhook {
  system_name: string;
  region_id: number;
  region_name: string;
}

export type AppView =
  | { kind: 'universe' }
  | { kind: 'region'; regionId: number; regionName: string };

export type RaidableByRegion = Map<number, Set<number>>;

// green = has currently open skyhook(s)
// red   = has open skyhooks but all close within 5 min AND nothing opens within 30 min
// white = no open skyhooks, but at least one opens within 30 min
export type RegionGlowStatus = 'green' | 'red' | 'white';

export interface RegionGlowSets {
  green: Set<number>;
  red: Set<number>;
  white: Set<number>;
}
