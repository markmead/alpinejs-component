const CACHE_ENTRY_LIMIT = 200

export function setBoundedCacheEntry(cacheMap, cacheKey, cacheValue) {
  cacheMap.set(cacheKey, cacheValue)

  // A Map iterates in insertion order, so its first key is always the oldest entry.
  while (cacheMap.size > CACHE_ENTRY_LIMIT) {
    const oldestCacheKey = cacheMap.keys().next().value

    cacheMap.delete(oldestCacheKey)
  }
}

export const templateFragmentCache = new Map()
export const remoteTemplateCache = new Map()
