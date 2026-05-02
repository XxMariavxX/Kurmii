const strategies = {
  bearer: (token) => ({ Authorization: `Bearer ${token}` }),
  apikey: (key, headerName = "X-API-Key") => ({ [headerName]: key }),
  basic: (username, password) => ({
    Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
  }),
};

function createAuthProxy(credential, getToken) {
  const rateLimitMap = new Map();

  const checkRateLimit = (key, maxPerMinute) => {
    const now = Date.now();
    const window = 60_000;
    const entry = rateLimitMap.get(key) ?? { count: 0, start: now };

    if (now - entry.start > window) {
      entry.count = 0;
      entry.start = now;
    }

    entry.count += 1;
    rateLimitMap.set(key, entry);

    return entry.count <= maxPerMinute;
  };

  return async function proxyFetch(url, options = {}, proxyOptions = {}) {
    const { strategy = "bearer", headerName, rateLimit = Infinity, rateLimitKey = "default" } = proxyOptions;

    if (!checkRateLimit(rateLimitKey, rateLimit)) {
      throw Object.assign(new Error("Rate limit exceeded"), { code: "RATE_LIMIT" });
    }

    const token = typeof getToken === "function" ? await getToken() : credential;
    let authHeaders;

    if (strategy === "apikey") {
      authHeaders = strategies.apikey(token, headerName);
    } else if (strategy === "basic") {
      const [username, password] = token.split(":");
      authHeaders = strategies.basic(username, password);
    } else {
      authHeaders = strategies.bearer(token);
    }

    const mergedOptions = {
      ...options,
      headers: { ...options.headers, ...authHeaders },
    };

    const response = await fetch(url, mergedOptions);

    if (response.status === 401 && typeof getToken === "function") {
      const freshToken = await getToken(true);
      mergedOptions.headers = {
        ...options.headers,
        ...strategies.bearer(freshToken),
      };
      return fetch(url, mergedOptions);
    }

    return response;
  };
}

export default createAuthProxy;
