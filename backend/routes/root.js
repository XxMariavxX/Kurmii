import getWord from "../controllers/wordController.js";

export default async function (fastify, opts) {
  fastify.get('/daily-word', async function (request, reply) {
    return await getWord();
  })
}
