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
    // token already invalid or missing — treat as logged out
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

export async function checkWordStream(guess, onChunk) {
  try {
    const response = await fetch(`${API_BASE}/check-word`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ guess }),
    });

    if (!response.ok) {
      let message = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        message = errorData?.error || message;
      } catch (error) {
        console.error("Error parse stream error response", error);
      }
      throw new Error(message);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Stream is not supported by the browser");
    }

    const decoder = new TextDecoder();
    let buffer = "";

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
        } catch (error) {
          console.error("Stream parse error", error);
        }
      }
    }
  } catch (error) {
    console.error("Error check word stream", error);
    throw error;
  }
}