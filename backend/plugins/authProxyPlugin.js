import fp from "fastify-plugin";
import createAuthProxy from "../lib/authProxy.js";

async function authProxyPlugin(fastify) {
  const serviceProxy = createAuthProxy(process.env.EXTERNAL_API_KEY ?? "");
  fastify.decorate("serviceProxy", serviceProxy);
}

export default fp(authProxyPlugin);
