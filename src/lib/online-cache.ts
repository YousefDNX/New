/**
 * BTC — Online Data Caching & Stale-While-Revalidate Engine
 * Optimized for low-end mobile devices and offline continuity.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  etag?: string;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();
const CACHE_PREFIX = "btc.online_cache.v1.";
const DEFAULT_TTL_MS = 1000 * 60 * 5; // 5 minutes

export function getCachedData<T>(key: string): T | null {
  const mem = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (mem) {
    return mem.data;
  }

  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(CACHE_PREFIX + key);
      if (raw) {
        const parsed = JSON.parse(raw) as CacheEntry<T>;
        if (Date.now() - parsed.timestamp < DEFAULT_TTL_MS * 3) {
          memoryCache.set(key, parsed);
          return parsed.data;
        }
      }
    } catch {
      // Ignore storage errors
    }
  }
  return null;
}

export function setCachedData<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
  };
  memoryCache.set(key, entry);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch {
      // Ignore quota errors
    }
  }
}

export async function fetchWithOnlineCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: { ttlMs?: number; forceRefresh?: boolean },
): Promise<T> {
  const ttl = options?.ttlMs ?? DEFAULT_TTL_MS;
  const cached = getCachedData<T>(key);
  const mem = memoryCache.get(key);

  const isStale = !mem || Date.now() - mem.timestamp > ttl;

  if (cached && !isStale && !options?.forceRefresh) {
    return cached;
  }

  // If online or force refresh, attempt fetch
  const isOnline = typeof navigator === "undefined" || navigator.onLine;
  if (!isOnline && cached) {
    return cached;
  }

  try {
    const freshData = await fetcher();
    setCachedData(key, freshData);
    return freshData;
  } catch (err) {
    if (cached) {
      return cached; // Fallback to stale cache on network failure
    }
    throw err;
  }
}

export function clearOnlineCache(): void {
  memoryCache.clear();
  if (typeof window !== "undefined") {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(CACHE_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      for (const k of keysToRemove) {
        window.localStorage.removeItem(k);
      }
    } catch {
      // Ignore
    }
  }
}
