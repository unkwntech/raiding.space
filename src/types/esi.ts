export interface EsiSystem {
  system_id: number;
  name: string;
  constellation_id: number;
}

export interface EsiConstellation {
  constellation_id: number;
  name: string;
  region_id: number;
}

export interface EsiRegion {
  region_id: number;
  name: string;
}
