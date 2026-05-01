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

function timeoutIterator(iterator, timeoutSeconds, onValue) {
  const deadline = Date.now() + timeoutSeconds * 1000;
  let count = 0;

  while (Date.now() < deadline) {
    const { value, done } = iterator.next();

    if (done) break;

    count += 1;
    if (typeof onValue === "function") {
      onValue(value, count);
    }
  }

  return count;
}

export { timeoutIterator };
export default generatorWord;