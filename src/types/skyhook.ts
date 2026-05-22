export interface TheftVulnerability {
  start: string;
  end: string;
}

export interface RaidableSkyhook {
  planet_id: number;
  solar_system_id: number;
  theft_vulnerability: TheftVulnerability;
}

export interface RaidableSkyhooksResponse {
  skyhooks: RaidableSkyhook[];
}
