import { PrismaClient } from "@prisma/client";

export type CreateUserInput = {
  name: string;
  surname: string;
  email: string;
  passwordHash: string;
};

export async function createUser(prisma: PrismaClient, user: CreateUserInput) {
  return await prisma.user.create({
    data: user,
  });
}

export type CreateSessionInput = {
  id: string;
  userId: number;
  tokenHash: string;
  expiresAt: Date;
};

export async function createSession(
  prisma: PrismaClient,
  session: CreateSessionInput,
) {
  return await prisma.refreshSession.create({
    data: session,
  });
}

export async function findUserByEmail(prisma: PrismaClient, email: string) {
  return prisma.user.findUnique({ where: { email } });
}
