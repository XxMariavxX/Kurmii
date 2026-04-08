import { getDailyWordMeta, checkGuess } from "../controllers/wordController.js";
import { newFilter, checkWordMatchSlowly } from "../lib/asyncHelpers.js";
import fiveLetterWords from ".../words/fiveLetterWords.js";

export default async function (fastify, opts) {
  fastify.get("/daily-word", async function (request, reply) {
    return getDailyWordMeta();
  });

  fastify.post("/check-word", async function (request, reply) {
    const { guess } = request.body;

    if (!guess || typeof guess !== "string") {
      return reply.code(400).send({ error: "Invalid guess: must be a string" });
    }

    try {
      const result = checkGuess(guess);
      return result;
    } catch (error) {
      return reply.code(400).send({ error: error.message });
    }
  });

  fastify.get("/hints", async function (request, reply) {
    const { letter } = request.query;

    if (!letter || typeof letter !== "string") {
      return reply.code(400).send({ error: "Choose the letter for tip" });
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const timeOutId = setTimeout(() => {
      controller.abort();
    }, 3000);

    try {
      const matchingWords = await newFilter(
        fiveLetterWords,
        (word, sig) => checkWordMatchSlowly(word, letter, sig), signal
      );

      clearTimeout(timeOutId);
    }
  });
}
