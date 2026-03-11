import { dailyWord } from "../services/dailyWordGenerator.js";

const globalDailyWord = dailyWord();

const getWord = async () => {
  const word = globalDailyWord.next().value;

  return {
    word: word,
    length: word.length,
  };
};

export default getWord;
