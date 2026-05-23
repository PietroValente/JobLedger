import { PrismaClient } from "@prisma/client";

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
