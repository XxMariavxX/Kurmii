import path from "node:path";
import { fileURLToPath } from "node:url";
import AutoLoad from "@fastify/autoload";
import cors from "@fastify/cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {}

export default async function (fastify, opts) {

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