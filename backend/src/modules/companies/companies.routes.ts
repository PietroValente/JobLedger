import { FastifyInstance, FastifyRequest } from "fastify";
import { ErrorOutputSchema } from "../utils/schema.js";
import {
  CompanyOutput,
  CreateCompanyType,
  CreateCompanySchema,
  ListCompanyOutput,
} from "./companies.schema.js";
import { listCompanies, regsiterCompany } from "./companies.service.js";

export async function companiesRoutes(app: FastifyInstance) {
  app.post(
    "",
    {
      preHandler: [app.authenticate],
      schema: {
        body: CreateCompanySchema,
        response: {
          200: CompanyOutput,
          401: ErrorOutputSchema,
        },
      },
    },
    async (request: FastifyRequest<{ Body: CreateCompanyType }>, reply) => {
      const company = await regsiterCompany(
        app,
        request.user.sub,
        request.body,
      );
      return {
        name: company.name,
        website: company.website,
        location: company.location,
        notes: company.notes,
      };
    },
  );

  app.get(
    "",
    {
      preHandler: [app.authenticate],
      schema: {
        response: {
          200: ListCompanyOutput,
          400: ErrorOutputSchema,
        },
      },
    },
    async (request, reply) => {
      const companies = await listCompanies(app, request.user.sub);
      return companies.map((company) => ({
        name: company.name,
        website: company.website,
        location: company.location,
        notes: company.notes,
      }));
    },
  );

  app.get("/:id", async () => {});
  app.put("/:id", async () => {});
  app.delete("/:id", async () => {});
}
