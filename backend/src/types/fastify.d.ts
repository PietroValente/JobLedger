import { PrismaClient } from "@prisma/client/extension";
import { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
    config: {
      DATABASE_URL: string;
      JWT_SECRET: string;
      NODE_ENV: string;
    };
  }
}
