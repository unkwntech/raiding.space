import { RaidableSkyhooksResponse } from '../types/skyhook';
import { cacheGet, cacheGetExpiresAt, cacheSet, expiresAtFromResponse } from '../utils/localStorageCache';

const CACHE_KEY = 'esi:skyhooks:raidable';

export interface SkyhooksResult {
  data: RaidableSkyhooksResponse;
  expiresAt: number;
}

export async function fetchRaidableSkyhooks(): Promise<SkyhooksResult> {
  const cached = cacheGet<RaidableSkyhooksResponse>(CACHE_KEY);
  if (cached) {
    return { data: cached, expiresAt: cacheGetExpiresAt(CACHE_KEY) ?? Date.now() };
  }

  const response = await fetch('https://esi.evetech.net/skyhooks/raidable', {
    headers: { 'X-Compatibility-Date': '2026-05-19' },
  });
  if (!response.ok) {
    throw new Error(`Skyhook API error: ${response.status} ${response.statusText}`);
  }

  const expiresAt = expiresAtFromResponse(response);
  const data = await response.json() as RaidableSkyhooksResponse;
  cacheSet(CACHE_KEY, data, expiresAt);
  return { data, expiresAt };
}
