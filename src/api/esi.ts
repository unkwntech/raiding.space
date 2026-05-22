import { EsiConstellation, EsiRegion, EsiSystem } from '../types/esi';
import { cacheGet, cacheSet, expiresAtFromResponse } from '../utils/localStorageCache';

const BASE = 'https://esi.evetech.net/latest/universe';

const systemCache = new Map<number, EsiSystem>();
const constellationCache = new Map<number, EsiConstellation>();
const regionCache = new Map<number, EsiRegion>();

async function fetchJsonWithCache<T>(url: string, cacheKey: string, memCache: Map<number, T>, id: number): Promise<T> {
  const memHit = memCache.get(id);
  if (memHit) return memHit;

  const lsHit = cacheGet<T>(cacheKey);
  if (lsHit) {
    memCache.set(id, lsHit);
    return lsHit;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`ESI error ${response.status}: ${url}`);
  }
  const expiresAt = expiresAtFromResponse(response);
  const data = await response.json() as T;
  cacheSet(cacheKey, data, expiresAt);
  memCache.set(id, data);
  return data;
}

export async function fetchSystem(id: number): Promise<EsiSystem> {
  return fetchJsonWithCache<EsiSystem>(
    `${BASE}/systems/${id}/`,
    `esi:system:${id}`,
    systemCache,
    id,
  );
}

export async function fetchConstellation(id: number): Promise<EsiConstellation> {
  return fetchJsonWithCache<EsiConstellation>(
    `${BASE}/constellations/${id}/`,
    `esi:constellation:${id}`,
    constellationCache,
    id,
  );
}

export async function fetchRegion(id: number): Promise<EsiRegion> {
  return fetchJsonWithCache<EsiRegion>(
    `${BASE}/regions/${id}/`,
    `esi:region:${id}`,
    regionCache,
    id,
  );
}
