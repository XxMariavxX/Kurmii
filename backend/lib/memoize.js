function memoize(fn, options = {}) {
  const normalizedOptions = typeof options === "number" ? { capacity: options } : options;

  const { capacity = Infinity, policy = "LFU" } = normalizedOptions;

  const cache = new Map();

  return function (...args) {
    const key = JSON.stringify(args);
    const now = Date.now();

    if (cache.has(key)) {
      const entry = cache.get(key);
      entry.lastAccessed = now;
      entry.accessCount += 1;

      if (policy.toLowerCase() === "lru") {
        cache.delete(key);
        cache.set(key, entry);
      }

      return entry.value;
    }

    const result = fn(...args);

    if (cache.size >= capacity && cache.size > 0) {
      let keyToRemove = null;

      if (policy.toLowerCase() === "lru") {
        keyToRemove = cache.keys().next().value;
      } else {
        let minCount = Infinity;
        let oldestAccess = Infinity;

        for (const [cacheKey, value] of cache.entries()) {
          const isLowerFrequency = value.accessCount < minCount;
          const isSameFrequencyOlder = value.accessCount === minCount && value.lastAccessed < oldestAccess;

          if (isLowerFrequency || isSameFrequencyOlder) {
            minCount = value.accessCount;
            oldestAccess = value.lastAccessed;
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
      lastAccessed: now,
      accessCount: 1,
    });

    return result;
  };
}

export default memoize;