import generatorWord from '../lib/wordGenerator.js';
import fiveLetterWords from '../words/fiveLetterWords.js';
import memoize from '../lib/memoize.js';


const calculateWordIndexByDate = (dateString) => {

  const [year, month, day] = dateString.split('-').map(Number);
  const dateNumber = year * 10000 + month * 100 + day;
  
  let seed = dateNumber;
  let random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  
  let generator = generatorWord(fiveLetterWords);

  const index = Math.floor(random() * fiveLetterWords.length);
  
  for (let i = 0; i <= index; i++) {
    generator.next();
  }
  
  return generator.next().value;
};

const getMemoizedDailyWord = memoize(calculateWordIndexByDate, { capacity: 365 });

export const dailyWord = () => {
  return {
    next() {
      const today = new Date().toISOString().split('T')[0];
      const word = getMemoizedDailyWord(today);
      
      return {
        value: word,
        done: false,
      };
    },

    [Symbol.iterator]() {
      return this;
    },
  };
};
