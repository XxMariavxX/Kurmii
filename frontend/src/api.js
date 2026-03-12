const API_BASE = '/api';

export async function fetchDailyWord() {
  const response = await fetch(`${API_BASE}/daily-word`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}
