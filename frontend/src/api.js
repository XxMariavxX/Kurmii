const API_BASE = '/api';

export async function fetchDailyWordMeta() {
  const response = await fetch(`${API_BASE}/daily-word`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json(); // { wordLength: 5, gameId: "2026-04-01" }
}

export async function checkWord(guess) {
  const response = await fetch(`${API_BASE}/check-word`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ guess }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}
