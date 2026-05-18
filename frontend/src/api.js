const API_BASE = "/api";

const TOKEN_KEY = "auth_token";

export const setAuthToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
export const clearAuthToken = () => localStorage.removeItem(TOKEN_KEY);

const authHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const requestJson = async (url, options) => {
  const response = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...options?.headers },
  });

  if (!response.ok) {
    if (response.status === 401) clearAuthToken();
    let message = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      message = errorData?.error || message;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  return response.json();
};

export async function login(username, password) {
  const data = await requestJson(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  setAuthToken(data.token);
  return data;
}

export async function register(username, password) {
  const data = await requestJson(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  setAuthToken(data.token);
  return data;
}

export async function logout() {
  try {
    await requestJson(`${API_BASE}/logout`, { method: "POST" });
  } catch {
  } finally {
    clearAuthToken();
  }
}

export async function fetchDailyWordMeta() {
  try {
    return await requestJson(`${API_BASE}/daily-word`);
  } catch (error) {
    console.error("Error fetch daily word meta", error);
    throw error;
  }
}

export async function fetchWordDefinition(word) {
  return requestJson(`${API_BASE}/word-definition?word=${encodeURIComponent(word)}`);
}

export async function fetchDaylyHints(guessLetter) {
  try {
    return await requestJson(
      `${API_BASE}/hints?guessed=${encodeURIComponent(guessLetter ?? "")}`
    );
  } catch (error) {
    console.error("Error fetch hints", error);
    throw error;
  }
}

export async function checkWordStream(guess, onChunk, { onError, timeoutMs = 10000 } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE}/check-word`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ guess }),
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 401) clearAuthToken();
      let message = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        message = errorData?.error || message;
      } catch {
        // ignore parse error on error response
      }
      throw new Error(message);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Stream is not supported by the browser");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const line = part.split("\n").find((item) => item.startsWith("data: "));
          if (!line) continue;

          const payload = line.replace("data: ", "").trim();
          if (!payload || payload === "done") continue;

          try {
            const data = JSON.parse(payload);
            onChunk?.(data);
          } catch (parseErr) {
            console.error("Stream parse error:", parseErr, "payload:", payload);
            onError?.(parseErr);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutErr = new Error("Connection timed out. Please try again.");
      console.error("checkWordStream timed out");
      throw timeoutErr;
    }
    console.error("Error check word stream", error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}