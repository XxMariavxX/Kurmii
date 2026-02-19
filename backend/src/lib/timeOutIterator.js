import { generatorWord } from './wordGenerator.js';
import fiveLetterWords from '../words/fiveLetterWords.js';

const globalWordGenerator = generatorWord(fiveLetterWords);

export const createDailyWordGenerator = () => {
  let currentWordDate = new Date();
  let currentDailyWord = globalWordGenerator.next().value;

  return {
    next() {
      const today = new Date();

      if (
        today.getFullYear() !== currentWordDate.getFullYear() ||
        today.getMonth() !== currentWordDate.getMonth() ||
        today.getDate() !== currentWordDate.getDate()
      ) {
        currentWordDate = today;
        currentDailyWord = globalWordGenerator.next().value;
      }

      return {
        value: currentDailyWord,
        done: false,
      };
    },

    [Symbol.iterator]() {
      return this;
    },
  };
};
