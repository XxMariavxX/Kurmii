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

const getToken = async (fastify) => {
  const response = await fastify.inject({
    method: "POST",
    url: "/api/login",
    payload: { username: "admin", password: "admin123" },
  });
  return JSON.parse(response.body).token;
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

test("POST /api/login returns token", async () => {
  const fastify = await buildServer();

  const response = await fastify.inject({
    method: "POST",
    url: "/api/login",
    payload: { username: "admin", password: "admin123" },
  });

  assert.equal(response.statusCode, 200);
  const body = JSON.parse(response.body);
  assert.equal(body.success, true);
  assert.ok(typeof body.token === "string" && body.token.length > 0);

  await fastify.close();
});

test("POST /check-word requires auth", async () => {
  const fastify = await buildServer();

  const response = await fastify.inject({
    method: "POST",
    url: "/check-word",
    payload: { guess: "crane" },
  });

  assert.equal(response.statusCode, 401);

  await fastify.close();
});

test("POST /check-word validates input", async () => {
  const fastify = await buildServer();
  const token = await getToken(fastify);

  const response = await fastify.inject({
    method: "POST",
    url: "/check-word",
    payload: { guess: "abc" },
    headers: { Authorization: `Bearer ${token}` },
  });

  assert.equal(response.statusCode, 400);
  const body = JSON.parse(response.body);
  assert.ok(body.error);

  await fastify.close();
});

test("GET /hints requires auth", async () => {
  const fastify = await buildServer();

  const response = await fastify.inject({
    method: "GET",
    url: "/hints?guessed=",
  });

  assert.equal(response.statusCode, 401);

  await fastify.close();
});

test("GET /hints returns hint or message", async () => {
  const fastify = await buildServer();
  const token = await getToken(fastify);

  const response = await fastify.inject({
    method: "GET",
    url: "/hints?guessed=",
    headers: { Authorization: `Bearer ${token}` },
  });

  assert.equal(response.statusCode, 200);
  const body = JSON.parse(response.body || "{}");
  assert.ok("hint" in body);

  await fastify.close();
});

test("POST /logout revokes token", async () => {
  const fastify = await buildServer();
  const token = await getToken(fastify);

  const logoutResponse = await fastify.inject({
    method: "POST",
    url: "/logout",
    headers: { Authorization: `Bearer ${token}` },
  });

  assert.equal(logoutResponse.statusCode, 200);

  const afterLogout = await fastify.inject({
    method: "GET",
    url: "/hints?guessed=",
    headers: { Authorization: `Bearer ${token}` },
  });

  assert.equal(afterLogout.statusCode, 401);

  await fastify.close();
});
