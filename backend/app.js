import path from "node:path";
import { fileURLToPath } from "node:url";
import AutoLoad from "@fastify/autoload";
import cors from "@fastify/cors";
import generatorWord, { timeoutIterator } from "./lib/wordGenerator.js";
import fiveLetterWords from "./words/fiveLetterWords.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {}

export default async function (fastify, opts) {
  const sampledCount = timeoutIterator(generatorWord(fiveLetterWords), 0.01);
  fastify.log.info(`Generator startup check: sampled ${sampledCount} words`);

  fastify.register(cors, {
    origin: true,
  });

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  })
}

export { options };