import { dailyWord } from "../services/dailyWordGenerator.js";
import fiveLetterWords from "../words/fiveLetterWords.js";
import memoize from "../lib/memoize.js";

const validWords = new Set(fiveLetterWords.map(word => word.toUpperCase()));

export const getDailyWord = () => {
  const dw = dailyWord();
  return dw.next().value.toUpperCase();
};

export const getDailyWordMeta = () => {
  const today = new Date().toISOString().split('T')[0];
  return {
    wordLength: 5,
    gameId: today
  };
};

// 1. ВІДКРИВАЄМО функцію _checkGuess. Вона приймає guess і ТЕПЕРІШНЄ СЛОВО (targetWord)
const _checkGuess = (guess, targetWord) => { 
  const normalizedGuess = guess.toUpperCase();

  // 2. ВСЯ логіка перевірок лежить ВСЕРЕДИНІ цих фігурних дужок
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

};

const memoizedCheckGuess = memoize(_checkGuess, { capacity: 10 });

export const checkGuess = (guess) => {
  const currentDailyWord = getDailyWord(); 
  return memoizedCheckGuess(guess, currentDailyWord);
};