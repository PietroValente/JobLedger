import { FastifyInstance } from "fastify";
import {
  createCompany,
  CreateCompanyData,
  getCompanies,
} from "./companies.repository.js";
import { CreateCompanyType } from "./companies.schema.js";

export async function regsiterCompany(
  app: FastifyInstance,
  userId: number,
  data: CreateCompanyType,
) {
  const payload: CreateCompanyData = { ...data, userId };
  return await createCompany(app.prisma, payload);
}

export async function listCompanies(app: FastifyInstance, userId: number) {
  return await getCompanies(app.prisma, userId);
}
