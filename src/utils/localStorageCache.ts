interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() >= entry.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, data: T, expiresAt: number): void {
  try {
    const entry: CacheEntry<T> = { data, expiresAt };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // localStorage may be full or unavailable; silently skip
  }
}

export function cacheGetExpiresAt(key: string): number | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<unknown>;
    if (Date.now() >= entry.expiresAt) return null;
    return entry.expiresAt;
  } catch {
    return null;
  }
}

export function expiresAtFromResponse(response: Response): number {
  const expires = response.headers.get('Expires');
  if (expires) {
    const ms = Date.parse(expires);
    if (!isNaN(ms) && ms > Date.now()) return ms;
  }
  const cc = response.headers.get('Cache-Control');
  if (cc) {
    const match = cc.match(/max-age=(\d+)/);
    if (match) return Date.now() + parseInt(match[1], 10) * 1000;
  }
  // Default: 5 minutes
  return Date.now() + 5 * 60 * 1000;
}
