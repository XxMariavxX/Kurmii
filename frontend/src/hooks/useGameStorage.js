import { useState, useEffect } from "react";

const STORAGE_KEY = "kurmi_game_state";

const defaultState = (gameId) => ({
  gameId,
  guesses: Array(6).fill(""),
  results: Array(6).fill(null),
  currentRow: 0,
  hintCount: 0,
  hintedLetters: [],
  finished: false,
});

const load = (gameId) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState(gameId);
    const saved = JSON.parse(raw);
    if (saved.gameId !== gameId) return defaultState(gameId);
    return saved;
  } catch {
    return defaultState(gameId);
  }
};

const save = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
};

export function useGameStorage(gameId) {
  const [state, setState] = useState(() => load(gameId));

  useEffect(() => {
    if (!gameId) return;
    const fresh = load(gameId);
    setState(fresh);
  }, [gameId]);

  const update = (patch) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      save(next);
      return next;
    });
  };

  const reset = () => {
    const fresh = defaultState(gameId);
    save(fresh);
    setState(fresh);
  };

  return { state, update, reset };
}
