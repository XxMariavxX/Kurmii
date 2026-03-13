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
        return entry.value;
      }

      cache.delete(key);
    }

    const result = fn(...args);

    if (cache.size >= capacity && cache.size > 0) {
      let keyToRemove = null;

      if (policy.toLowerCase() === "custom" && typeof custom === "function") {
        keyToRemove = custom(cache);
      } else if (policy.toLowerCase() === "lru") {
        let oldestTime = Infinity;

        for (const [cacheKey, value] of cache.entries()) {
          if (value.lastAccessed < oldestTime) {
            oldestTime = value.lastAccessed;
            keyToRemove = cacheKey;
          }
        }
      } else {
        let minCount = Infinity;

        for (const [cacheKey, value] of cache.entries()) {
          if (value.accessCount < minCount) {
            minCount = value.accessCount;
            keyToRemove = cacheKey;
          }
        }
      }

      if (keyToRemove !== null) {
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
