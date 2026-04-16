import { getDailyWordMeta, checkGuess, getDailyWord } from "../controllers/wordController.js";
import { newFilter, checkWordMatchSlowly } from "../lib/helpers.js";

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
    const { guessed } = request.query;

    const guessedArray = guessed ? guessed.toUpperCase().split(',') : [];

    const dailyWord = getDailyWord();
    const lettersArray = dailyWord.split('');

    const controller = new AbortController();
    const signal = controller.signal;

    const timeOutId = setTimeout(() => {
      controller.abort();
    }, 3000);

    try {
      const availableHint = await newFilter(
        lettersArray,
        (letter, sig) => checkWordMatchSlowly(letter, guessedArray, sig), signal
      );

      clearTimeout(timeOutId);

      if (availableHint.length === 0) {
        return reply.send({ hint: null, message: 'You guess all letters' });
      }
      const randomHint = availableHint[Math.floor(Math.random() * availableHint.length)];
      return reply.send({ hint: randomHint });
    } catch (error) {

      if (error.name === 'AbortError') {
        return reply.code(408).send({ error: "The time is run out" });
      }
      return reply.code(500).send({ error: "error " + error.message });
    }
  });
}
