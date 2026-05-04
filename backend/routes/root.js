import {
  getDailyWordMeta,
  checkGuess,
  getDailyWord,
} from "../controllers/wordController.js";
import { newFilter, checkWordMatchSlowly } from "../lib/helpers.js";
import PriorityQueue from "../lib/priorityQueue.js";
import { validWords } from "../lib/wordDictionary.js";
import { loginUser, verifyToken, revokeToken, registerUser } from "../controllers/authController.js";

const authenticate = async (request, reply) => {
  const auth = request.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return reply.code(401).send({ error: "Unauthorized" });
  }
  const user = verifyToken(auth.slice(7));
  if (!user) {
    return reply.code(401).send({ error: "Invalid or expired token" });
  }
  request.user = user;
};

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

export default async function (fastify) {
  fastify.get("/daily-word", async function () {
    return getDailyWordMeta();
  });

  fastify.post("/check-word", { preHandler: authenticate }, async function (request, reply) {
    const rawGuess = request.body?.guess;

    if (!rawGuess || typeof rawGuess !== "string") {
      return reply.code(400).send({ error: "Invalid guess: must be a string" });
    }

    const guess = rawGuess.toUpperCase();

    if (guess.length !== 5) {
      return reply.code(400).send({ error: "Invalid guess: must be 5 letter" });
    }

    if (!validWords.has(guess)) {
      return reply.code(400).send({ error: "Word not found in dictionary" });
    }

    let statuses;

    try {
      const checkData = checkGuess(guess);
      statuses = checkData.result;
    } catch (error) {
      return reply.code(400).send({ error: error.message || "Invalid guess" });
    }

    reply.hijack();
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    async function* validateLetterByLetter() {
      const correctLetterCount = statuses.filter((s) => s === "correct").length;

      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 200));

        yield JSON.stringify({
          type: "letter",
          index: i,
          letter: guess[i],
          status: statuses[i],
        });
      }

      if (correctLetterCount === 5) {
        yield JSON.stringify({ type: "result", message: "You win" });
      }
    }

    try {
      const validationStream = validateLetterByLetter();
      for await (const chunk of validationStream) {
        reply.raw.write(`data: ${chunk}\n\n`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      reply.raw.write(`event: end\ndata: done\n\n`);
      reply.raw.end();
    }
  });

  fastify.get("/hints", { preHandler: authenticate }, async function (request, reply) {
    const { guessed } = request.query;

    const guessedArray = guessed ? guessed.toUpperCase().split(",") : [];

    const dailyWord = getDailyWord();
    const lettersArray = dailyWord.split("");

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
            signal,
          );

          if (availableHint.length === 0) {
            return {
              status: 200,
              body: { hint: null, message: "You guess all letters" },
            };
          }

          const randomHint =
            availableHint[Math.floor(Math.random() * availableHint.length)];
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
        return reply
          .code(429)
          .send({ error: "Too many hint requests. Try again later." });
      }
      return reply.code(500).send({ error: "error " + error.message });
    }

  });

  fastify.post("/register", async (request, reply) => {
    const { username, password } = request.body ?? {};
    const result = registerUser(username, password);
    if (result.success) return reply.code(201).send(result);
    return reply.code(400).send(result);
  });

  fastify.post("/login", async (request, reply) => {
    const { username, password } = request.body;

    const result = loginUser(username, password);

    if (result.success) {
      return reply.send(result);
    } else {
      return reply.code(401).send(result);
    }
  });

  fastify.post("/logout", { preHandler: authenticate }, async (request, reply) => {
    const token = request.headers.authorization.slice(7);
    revokeToken(token);
    return reply.send({ success: true });
  });
}