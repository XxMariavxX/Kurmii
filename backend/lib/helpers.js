export const newFilter = async (array, asyncCallback, signal) => {
  const promise = await Promise.all(
    array.map(async (item) => {
      if (signal && signal.aborted) {
        throw new Error("The process closed");
      }
      return await asyncCallback(item, signal);
    }),
  );

  return array.filter((_, index) => promise[index]);
};

export const checkWordMatchSlowly = async (letter, guessedArray, signal) => {
  return new Promise((resolve, reject) => {

    const timer = setTimeout(() => {
      const isHidden = !guessedArray.includes(letter);
      resolve(isHidden);
    }, 500);

    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);

        const abortError = new Error("The process was aborted");
        abortError.name = 'AbortError';
        reject(abortError);
      });
    }
  });
}