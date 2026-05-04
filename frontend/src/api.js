const API_BASE = "/api";

const requestJson = async (url, options) => {
  const response = await fetch(url, options);

  if (!response.ok) {
    let message = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      message = errorData?.error || message;
    } catch(error){
      console.error("Error")
    }
    throw new Error(message);
  }

  return response.json();
};

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