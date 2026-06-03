import { FastifyInstance, FastifyRequest } from "fastify";
import {
  ApplicationIdSchema,
  ApplicationIdType,
  ApplicationOutputSchema,
  CreateApplicationSchema,
  CreateApplicationType,
  ListApplicationOutputSchema,
  UpdateApplicationSchema,
  UpdateApplicationType,
} from "./applications.schema.js";
import { ErrorOutputSchema } from "../utils/schema.js";
import {
  CompanyIdSchema,
  CompanyIdType,
} from "../companies/companies.schema.js";

export async function applicationsRoutes(app: FastifyInstance) {
  app.post(
    "",
    {
      preHandler: [app.authenticate],
      schema: {
        params: CompanyIdSchema,
        body: CreateApplicationSchema,
        response: {
          200: ApplicationOutputSchema,
          400: ErrorOutputSchema,
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: CompanyIdType;
        Body: CreateApplicationType;
      }>,
      reply,
    ) => {},
  );
  app.get(
    "",
    {
      preHandler: [app.authenticate],
      schema: {
        params: CompanyIdSchema,
        response: {
          200: ListApplicationOutputSchema,
          400: ErrorOutputSchema,
        },
      },
    },
    async (request: FastifyRequest<{ Params: CompanyIdType }>, reply) => {},
  );
  app.get(
    "/:applicationId",
    {
      preHandler: [app.authenticate],
      schema: {
        params: ApplicationIdSchema,
        response: {
          200: ApplicationOutputSchema,
          400: ErrorOutputSchema,
        },
      },
    },
    async (request: FastifyRequest<{ Params: ApplicationIdType }>, reply) => {},
  );
  app.put(
    "/:applicationId",
    {
      preHandler: [app.authenticate],
      schema: {
        params: ApplicationIdSchema,
        body: UpdateApplicationSchema,
        response: {
          200: ApplicationOutputSchema,
          400: ErrorOutputSchema,
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: ApplicationIdType;
        Body: UpdateApplicationType;
      }>,
      reply,
    ) => {},
  );
  app.delete(
    "/:applicationId",
    {
      preHandler: [app.authenticate],
      schema: {
        params: ApplicationIdSchema,
        response: {
          400: ErrorOutputSchema,
        },
      },
    },
    async (request: FastifyRequest<{ Params: ApplicationIdType }>, reply) => {},
  );
}
