import { dailyWord } from "../services/dailyWordGenerator.js";
import eventBus from "../lib/event.js";
import { validWords, normalizeWord } from "../lib/wordDictionary.js";
import memoize from "../lib/memoize.js";
import createLogger from "../lib/logger.js";

const log = createLogger({ level: "INFO" });

let currentDailyWord = normalizeWord(dailyWord().next().value);

eventBus.on("word:changed", ({ newWord }) => {
  if (typeof newWord === "string" && newWord.length === 5) {
    currentDailyWord = normalizeWord(newWord);
  }
});

export const getDailyWord = () => currentDailyWord;

export const getDailyWordMeta = () => {
  const today = new Date().toLocaleDateString('sv-SE');
  return {
    wordLength: 5,
    gameId: today
  };
};

function computeGuessCore(guess, targetWord) {
  const normalizedGuess = normalizeWord(guess);

  if (normalizedGuess.length !== 5) {
    throw new Error('Word must be exactly 5 letters long');
  }

  if (!validWords.has(normalizedGuess)) {
    throw new Error('Word not found in dictionary');
  }

  const result = [];
  const targetLetters = targetWord.split('');
  const guessLetters = normalizedGuess.split('');
  const used = new Array(5).fill(false);

  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      result[i] = 'correct';
      used[i] = true;
    } else {
      result[i] = null;
    }
  }

  for (let i = 0; i < 5; i++) {
    if (result[i] !== null) continue;

    const letter = guessLetters[i];
    const foundIndex = targetLetters.findIndex((l, idx) => l === letter && !used[idx]);

    if (foundIndex !== -1) {
      result[i] = 'present';
      used[foundIndex] = true;
    } else {
      result[i] = 'absent';
    }
  }

  return { result };
}

const memoizedCheckGuess = memoize(
  log(function computeGuess(guess, targetWord) {
    return computeGuessCore(guess, targetWord);
  }),
  { capacity: 10, ttl: 60 * 60 * 1000 }
);

export const checkGuess = (guess) => {
  const currentDailyWord = getDailyWord();
  return memoizedCheckGuess(guess, currentDailyWord);
};