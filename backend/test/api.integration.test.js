import test from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import app from "../app.js";
import { getDailyWord } from "../controllers/wordController.js";

const buildServer = async () => {
  const fastify = Fastify();
  await fastify.register(app);
  await fastify.ready();
  return fastify;
};

test("GET /daily-word returns meta", async () => {
  const fastify = await buildServer();

  const response = await fastify.inject({
    method: "GET",
    url: "/daily-word",
  });

  assert.equal(response.statusCode, 200);
  const body = JSON.parse(response.body);
  assert.equal(body.wordLength, 5);
  assert.match(body.gameId, /^\d{4}-\d{2}-\d{2}$/);

  await fastify.close();
});

test("POST /check-word validates input", async () => {
  const fastify = await buildServer();

  const invalidResponse = await fastify.inject({
    method: "POST",
    url: "/check-word",
    payload: { guess: "abc" },
  });

  assert.equal(invalidResponse.statusCode, 400);
  const invalidBody = JSON.parse(invalidResponse.body);
  assert.ok(invalidBody.error);

  await fastify.close();
});

test("POST /check-word accepts valid word", async () => {
  const fastify = await buildServer();
  const dailyWord = getDailyWord();

  const validResponse = await fastify.inject({
    method: "POST",
    url: "/check-word",
    payload: { guess: dailyWord.toLowerCase() },
  });

  assert.equal(validResponse.statusCode, 200);
  const validBody = JSON.parse(validResponse.body);
  assert.ok(Array.isArray(validBody.result));
  assert.equal(validBody.result.length, 5);

  await fastify.close();
});

test("GET /hints returns hint or message", async () => {
  const fastify = await buildServer();

  const response = await fastify.inject({
    method: "GET",
    url: "/hints?guessed=",
  });

  assert.equal(response.statusCode, 200);
  const body = JSON.parse(response.body || "{}");
  assert.ok("hint" in body);

  await fastify.close();
});
