import fiveLetterWords from "../words/fiveLetterWords.js";

export const validWords = new Set(
  fiveLetterWords.map((word) => word.toUpperCase())
);

export const normalizeWord = (word) =>
  typeof word === "string" ? word.toUpperCase() : word;
