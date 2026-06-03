import { PrismaClient } from "@prisma/client";
import { UpdateCompanyType } from "./companies.schema.js";

export type CreateCompanyData = {
  name: string;
  website?: string;
  location?: string;
  notes?: string;
  userId: number;
};

export async function createCompany(
  prisma: PrismaClient,
  data: CreateCompanyData,
) {
  return await prisma.company.create({
    data,
  });
}

export async function getCompanies(prisma: PrismaClient, userId: number) {
  return await prisma.company.findMany({
    where: {
      userId,
    },
  });
}

export async function getCompany(prisma: PrismaClient, companyId: string) {
  return await prisma.company.findUnique({
    where: {
      id: companyId,
    },
  });
}

export async function updateCompany(
  prisma: PrismaClient,
  companyId: string,
  data: UpdateCompanyType,
) {
  return await prisma.company.update({
    where: {
      id: companyId,
    },
    data,
  });
}

export async function deleteCompany(prisma: PrismaClient, companyId: string) {
  return await prisma.company.delete({
    where: {
      id: companyId,
    },
  });
}
