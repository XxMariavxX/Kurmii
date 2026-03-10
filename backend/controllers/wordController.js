const { dailyWord } = require("../services/dailyWordGenerator.js");

const globalDailyWord = dailyWord();

const getWord = async () => {
  const word = globalDailyWord.next().value;

  return {
    word: word,
    length: word.length,
  };
};

module.exports = { getWord };
