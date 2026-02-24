function* generatorWord(words) {
  const newWords = [];

  while (true) {
    if (newWords.length === 0) {
      newWords.push(...words);
    }

    let i = Math.floor(Math.random() * newWords.length);
    let word = newWords.splice(i, 1);

    yield word[0];
  }
}

export default generatorWord;