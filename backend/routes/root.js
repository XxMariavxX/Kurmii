'use strict'

import getWord from "../controllers/wordController";

export default async function (fastify, opts) {
  fastify.get('/daily-word', async function (request, reply) {
    return getWord;
  })
}
