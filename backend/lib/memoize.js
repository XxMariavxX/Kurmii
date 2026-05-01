function memoize(fn, options = {}) {
  const normalizedOptions = typeof options === "number" ? { capacity: options } : options;

  const { capacity = Infinity, policy = "LFU", ttl = null, evict = null } = normalizedOptions;

  const cache = new Map();

  const evictOne = () => {
    if (typeof evict === "function") {
      const entries = [...cache.entries()];
      const keyToRemove = evict(entries.map(([k, v]) => ({ key: k, ...v })));
      if (keyToRemove != null) cache.delete(keyToRemove);
      return;
    }

    const p = policy.toLowerCase();

    if (p === "lru") {
      cache.delete(cache.keys().next().value);
      return;
    }

    let keyToRemove = null;
    let minCount = Infinity;
    let oldestAccess = Infinity;

    for (const [cacheKey, value] of cache.entries()) {
      if (value.accessCount < minCount || (value.accessCount === minCount && value.lastAccessed < oldestAccess)) {
        minCount = value.accessCount;
        oldestAccess = value.lastAccessed;
        keyToRemove = cacheKey;
      }
    }

    if (keyToRemove !== null) cache.delete(keyToRemove);
  };

  return function (...args) {
    const key = JSON.stringify(args);
    const now = Date.now();

    if (ttl !== null) {
      for (const [k, v] of cache.entries()) {
        if (now - v.createdAt > ttl) cache.delete(k);
      }
    }

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
      evictOne();
    }

    cache.set(key, {
      value: result,
      lastAccessed: now,
      createdAt: now,
      accessCount: 1,
    });

    return result;
  };
}

export default memoize;