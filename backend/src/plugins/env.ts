import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import env from "@fastify/env";
import path from "node:path";

async function envPlugin(app: FastifyInstance) {
  await app.register(env, {
    schema: {
      type: "object",
      required: ["DATABASE_URL"],

      properties: {
        DATABASE_URL: {
          type: "string",
        },
        JWT_SECRET: {
          type: "string",
        },
        NODE_ENV: {
          type: "string",
        },
      },
    },
    dotenv: true,
  });
}

export default fp(envPlugin);
