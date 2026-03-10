'use strict'

const { getWord } = require('../controllers/wordController');

module.exports = async function (fastify, opts) {
  fastify.get('/daily-word', async function (request, reply) {
    return getWord()
  })
}
