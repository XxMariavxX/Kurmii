const PROFILE_KEY = "kurmi_profile";

const loadProfile = () => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : { username: null, history: [] };
  } catch {
    return { username: null, history: [] };
  }
};

const saveProfile = (profile) => {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {}
};

export const getProfile = () => loadProfile();

export const setProfileUsername = (username) => {
  const profile = loadProfile();
  profile.username = username;
  saveProfile(profile);
};

export const recordGame = ({ gameId, guesses, results, won, hintsUsed }) => {
  const profile = loadProfile();

  const alreadyRecorded = profile.history.some((e) => e.gameId === gameId);
  if (alreadyRecorded) return;

  const attempts = results.filter(Boolean).length;

  profile.history.unshift({
    gameId,
    won,
    attempts,
    hintsUsed,
    guesses: guesses.filter((g) => g.length > 0),
    results: results.filter(Boolean),
    date: new Date().toISOString(),
  });

  if (profile.history.length > 30) profile.history.length = 30;

  saveProfile(profile);
};

export const clearProfile = () => {
  localStorage.removeItem(PROFILE_KEY);
};

export const getStats = () => {
  const { history } = loadProfile();
  const played = history.length;
  const won = history.filter((g) => g.won).length;
  const winRate = played ? Math.round((won / played) * 100) : 0;
  const streak = (() => {
    let s = 0;
    for (const g of history) {
      if (!g.won) break;
      s++;
    }
    return s;
  })();
  const avgAttempts =
    played ? (history.reduce((sum, g) => sum + g.attempts, 0) / played).toFixed(1) : "—";
  return { played, won, winRate, streak, avgAttempts };
};
