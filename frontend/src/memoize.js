export function memoize(fn, options = {}) {
  const normalizedOptions =
    typeof options === "number" ? { capacity: options } : options;

  const {
    capacity = Infinity,
    policy = "LRU",
    ttl = 5000,
    custom = null,
  } = normalizedOptions;

  const cache = new Map();

  return function (...args) {
    const key = JSON.stringify(args);
    const now = Date.now();

    if (cache.has(key)) {
      const entry = cache.get(key);

      if (now - entry.createdAt <= ttl) {
        entry.lastAccessed = now;
        entry.accessCount += 1;

        if (policy.toLowerCase() === "lru") {
          cache.delete(key);
          cache.set(key, entry);
        }

        console.log(`[CACHE] : ${key}`);
        return entry.value;
      }
      
      cache.delete(key);
    }

    console.log(`[COMPUTE] : ${key}`);
    const result = fn(...args);

    if (cache.size >= capacity && cache.size > 0) {
      let keyToRemove = null;

      if (policy.toLowerCase() === "custom" && typeof custom === "function") {
        keyToRemove = custom(cache);
      } else if (policy.toLowerCase() === "lru") {
        keyToRemove = cache.keys().next().value;
      } else {
        let minCount = Infinity;
        let oldestAccess = Infinity;

        for (const [cacheKey, value] of cache.entries()) {
          const isLowerFrequency = value.accessCount < minCount;
          const isSameFrequencyOlder =
            value.accessCount === minCount && value.lastAccessed < oldestAccess;

          if (isLowerFrequency || isSameFrequencyOlder) {
            minCount = value.accessCount;
            oldestAccess = value.lastAccessed;
            keyToRemove = cacheKey;
          }
        }
      }

      if (keyToRemove !== null) {
        console.log(`[EVICT] ${policy}: ${keyToRemove}`);
        cache.delete(keyToRemove);
      }
    }

    cache.set(key, {
      value: result,
      createdAt: now,
      lastAccessed: now,
      accessCount: 1,
    });
    
    return result;
  };
}

export default memoize;