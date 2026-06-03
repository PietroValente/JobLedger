import { FastifyInstance } from "fastify";
import {
  createCompany,
  CreateCompanyData,
  deleteCompany,
  getCompanies,
  getCompany,
  updateCompany,
} from "./companies.repository.js";
import { CreateCompanyType, UpdateCompanyType } from "./companies.schema.js";

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

export async function getUserCompany(
  app: FastifyInstance,
  companyId: string,
  userId: number,
) {
  const company = await getCompany(app.prisma, companyId);
  if (!company || company.userId != userId) {
    throw app.httpErrors.notFound("Company not found!");
  }
  return company;
}

export type UpdateUserCompanyArgs = {
  app: FastifyInstance;
  companyId: string;
  userId: number;
  data: UpdateCompanyType;
};

export async function updateUserCompany(payload: UpdateUserCompanyArgs) {
  const company = await getCompany(payload.app.prisma, payload.companyId);
  if (!company || company.userId != payload.userId) {
    throw payload.app.httpErrors.notFound("Company not found!");
  }
  return await updateCompany(
    payload.app.prisma,
    payload.companyId,
    payload.data,
  );
}

export async function deleteUserCompany(
  app: FastifyInstance,
  companyId: string,
  userId: number,
) {
  const company = await getCompany(app.prisma, companyId);
  if (!company || company.userId != userId) {
    throw app.httpErrors.notFound("Company not found!");
  }
  await deleteCompany(app.prisma, companyId);
}
