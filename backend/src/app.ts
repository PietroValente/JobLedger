import Fastify, { FastifyError } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { healthRoutes } from "./modules/health/health.routes.js";
import authPlugin from "./plugins/auth.js";
import envPlugin from "./plugins/env.js";
import sensiblePlugin from "@fastify/sensible";
import jwtPlugin from "@fastify/jwt";
import cookiePlugin from "@fastify/cookie";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { PrismaClient } from "@prisma/client";
import { companiesRoutes } from "./modules/companies/companies.routes.js";
import { applicationsRoutes } from "./modules/applications/applications.routes.js";

export async function buildApp(db: PrismaClient) {
  const app = Fastify({
    logger: {
      transport: {
        target: "pino-pretty",
        options: {
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
          colorize: true,
        },
      },
    },
  });
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.setErrorHandler((error: FastifyError, request, reply) => {
    request.log.error(error);

    const statusCode = error.statusCode ?? 500;

    if (statusCode >= 500) {
      return reply.status(500).send({
        statusCode: 500,
        error: "Internal Server Error",
        message: "Something went wrong", //TODO: return request id
      });
    }

    return reply.status(statusCode).send({
      statusCode,
      error: error.name,
      message: error.message,
    });
  });

  //prisma decoration
  app.decorate("prisma", db);
  app.addHook("onClose", async () => {
    await db.$disconnect();
  });

  await app.register(envPlugin);
  await app.register(jwtPlugin, {
    secret: app.config.JWT_SECRET,
  });
  await app.register(cookiePlugin);
  await app.register(sensiblePlugin);
  await app.register(authPlugin);
  await app.register(healthRoutes);
  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(companiesRoutes, { prefix: "/companies" });
  await app.register(applicationsRoutes, {
    prefix: "/companies/:companyId/applications",
  });

  return app;
}
