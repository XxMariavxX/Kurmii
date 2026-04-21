const API_BASE = '/api';

export async function fetchDailyWordMeta() {
  try {
    
    const response = await fetch(`${API_BASE}/daily-word`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json(); // { wordLength: 5, gameId: "2026-04-01" }
  }catch (error){
    console.error(`Error take the word${error}`);
    throw error;
  }
}

export async function checkWord(guess) {
  try {
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
    return await response.json();
  } catch (error) {
    console.error(`Error check the guess ${error}`);
    throw error;
  }
}

export async function fetchDaylyHints(guessLetter) {
  try {

    const response = await fetch(`${API_BASE}/hints?guessed=${encodeURIComponent(guessLetter ?? "")}`);
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
  
    return await response.json();
  } catch (error) {
    console.error(`Error take hint: ${error}`);
    throw error;
  }
}