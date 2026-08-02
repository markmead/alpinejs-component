const TEMPLATE_FRAGMENT_LIMIT = 200
const REMOTE_FRAGMENT_LIMIT = 200

function createBoundedCache(entryLimit) {
  const cacheEntries = new Map()

  function moveToNewest(cacheKey, cacheValue) {
    cacheEntries.delete(cacheKey)
    cacheEntries.set(cacheKey, cacheValue)
  }

  function readEntry(cacheKey) {
    if (!cacheEntries.has(cacheKey)) {
      return undefined
    }

    const cacheValue = cacheEntries.get(cacheKey)

    // Reading counts as use, so eviction drops the least recently read entry rather than
    // whichever happened to be written first.
    moveToNewest(cacheKey, cacheValue)

    return cacheValue
  }

  function peekEntry(cacheKey) {
    return cacheEntries.get(cacheKey)
  }

  function writeEntry(cacheKey, cacheValue) {
    moveToNewest(cacheKey, cacheValue)

    while (cacheEntries.size > entryLimit) {
      const leastRecentlyUsedKey = cacheEntries.keys().next().value

      cacheEntries.delete(leastRecentlyUsedKey)
    }
  }

  function dropEntry(cacheKey) {
    cacheEntries.delete(cacheKey)
  }

  return { readEntry, peekEntry, writeEntry, dropEntry }
}

export const templateFragmentCache = createBoundedCache(TEMPLATE_FRAGMENT_LIMIT)
export const remoteFragmentPromiseCache = createBoundedCache(REMOTE_FRAGMENT_LIMIT)
