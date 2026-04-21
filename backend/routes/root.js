import { getDailyWordMeta, checkGuess, getDailyWord } from "../controllers/wordController.js";
import { newFilter, checkWordMatchSlowly } from "../lib/helpers.js";
import PriorityQueue from "../lib/priorityQueue.js";

const HINTS_CONCURRENCY = 4;
const hintsQueue = new PriorityQueue(50);
let activeHints = 0;

const processQueue = () => {
  while (activeHints < HINTS_CONCURRENCY && hintsQueue.size() > 0) {
    const entry = hintsQueue.dequeue("oldest");
    if (!entry) return;

    activeHints += 1;
    entry
      .task()
      .then(entry.resolve)
      .catch(entry.reject)
      .finally(() => {
        activeHints -= 1;
        processQueue();
      });
  }
};

const runHintTask = (task, priority = 0) =>
  new Promise((resolve, reject) => {
    if (activeHints < HINTS_CONCURRENCY) {
      activeHints += 1;
      task()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          activeHints -= 1;
          processQueue();
        });
      return;
    }

    if (hintsQueue.isFull()) {
      reject(new Error("Hints queue is full"));
      return;
    }

    hintsQueue.enqueue({ task, resolve, reject }, priority);
  });

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

    try {
      const result = await runHintTask(async () => {
        const controller = new AbortController();
        const signal = controller.signal;

        const timeOutId = setTimeout(() => {
          controller.abort();
        }, 3000);

        try {
          const availableHint = await newFilter(
            lettersArray,
            (letter, sig) => checkWordMatchSlowly(letter, guessedArray, sig),
            signal
          );

          if (availableHint.length === 0) {
            return { status: 200, body: { hint: null, message: "You guess all letters" } };
          }

          const randomHint = availableHint[Math.floor(Math.random() * availableHint.length)];
          return { status: 200, body: { hint: randomHint } };
        } catch (error) {
          if (error.name === "AbortError") {
            return { status: 408, body: { error: "The time is run out" } };
          }
          return { status: 500, body: { error: "error " + error.message } };
        } finally {
          clearTimeout(timeOutId);
        }
      }, Date.now());

      return reply.code(result.status).send(result.body);
    } catch (error) {
      if (error.message === "Hints queue is full") {
        return reply.code(429).send({ error: "Too many hint requests. Try again later." });
      }
      return reply.code(500).send({ error: "error " + error.message });
    }
  });
}
