import { getDailyWordMeta, checkGuess } from "../controllers/wordController.js";

export default async function (fastify, opts) {

  fastify.get('/daily-word', async function (request, reply) {
    return getDailyWordMeta();
  });

  fastify.post('/check-word', async function (request, reply) {
    const { guess } = request.body;

    if (!guess || typeof guess !== 'string') {
      return reply.code(400).send({ error: 'Invalid guess: must be a string' });
    }

    try {
      const result = checkGuess(guess);
      return result;
    } catch (error) {
      return reply.code(400).send({ error: error.message });
    }
  });
}
