import { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { ErrorOutputSchema } from "../utils/schema.js";
import {
  CompanyOutputSchema,
  CreateCompanyType,
  CreateCompanySchema,
  ListCompanyOutputSchema,
  CompanyIdSchema,
  CompanyIdType,
  UpdateCompanySchema,
  UpdateCompanyType,
} from "./companies.schema.js";
import {
  deleteUserCompany,
  getUserCompany,
  listCompanies,
  regsiterCompany,
  updateUserCompany,
  UpdateUserCompanyArgs,
} from "./companies.service.js";

export async function companiesRoutes(app: FastifyInstance) {
  app.post(
    "",
    {
      preHandler: [app.authenticate],
      schema: {
        body: CreateCompanySchema,
        response: {
          200: CompanyOutputSchema,
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
        id: company.id,
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
          200: ListCompanyOutputSchema,
          400: ErrorOutputSchema,
        },
      },
    },
    async (request, reply) => {
      const companies = await listCompanies(app, request.user.sub);
      return companies.map((company) => ({
        id: company.id,
        name: company.name,
        website: company.website,
        location: company.location,
        notes: company.notes,
      }));
    },
  );

  app.get(
    "/:companyId",
    {
      preHandler: [app.authenticate],
      schema: {
        params: CompanyIdSchema,
        response: {
          200: CompanyOutputSchema,
          400: ErrorOutputSchema,
        },
      },
    },
    async (request: FastifyRequest<{ Params: CompanyIdType }>, reply) => {
      return await getUserCompany(
        app,
        request.params.companyId,
        request.user.sub,
      );
    },
  );
  app.put(
    "/:companyId",
    {
      preHandler: [app.authenticate],
      schema: {
        params: CompanyIdSchema,
        body: UpdateCompanySchema,
        response: {
          200: CompanyOutputSchema,
          400: ErrorOutputSchema,
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: CompanyIdType;
        Body: UpdateCompanyType;
      }>,
    ) => {
      const payload: UpdateUserCompanyArgs = {
        app,
        companyId: request.params.companyId,
        userId: request.user.sub,
        data: request.body,
      };
      return await updateUserCompany(payload);
    },
  );
  app.delete(
    "/:companyId",
    {
      preHandler: [app.authenticate],
      schema: {
        params: CompanyIdSchema,
        response: {
          400: ErrorOutputSchema,
        },
      },
    },
    async (request: FastifyRequest<{ Params: CompanyIdType }>, reply) => {
      await deleteUserCompany(app, request.params.companyId, request.user.sub);
    },
  );
}
