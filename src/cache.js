const DEFAULT_CACHE_LIMIT = 100

function createBoundedCache(cacheLimit = DEFAULT_CACHE_LIMIT) {
  const boundedCache = new Map()

  boundedCache.maxEntries = cacheLimit

  return boundedCache
}

export function setBoundedCacheEntry(cacheMap, cacheKey, cacheValue) {
  cacheMap.set(cacheKey, cacheValue)

  while (cacheMap.size > cacheMap.maxEntries) {
    const oldestCacheKey = cacheMap.keys().next().value

    cacheMap.delete(oldestCacheKey)
  }
}

export const templateFragmentCache = createBoundedCache(200)
export const remoteTemplateCache = createBoundedCache(200)
export const adoptedStylesheetCache = createBoundedCache(100)
