import { PrismaClient } from "@prisma/client";

export type CreateUserData = {
  name: string;
  surname: string;
  email: string;
  passwordHash: string;
};

export async function createUser(prisma: PrismaClient, user: CreateUserData) {
  return await prisma.user.create({
    data: user,
  });
}

export type CreateSessionData = {
  id: string;
  userId: number;
  tokenHash: string;
  expiresAt: Date;
};

export async function createSession(
  prisma: PrismaClient,
  session: CreateSessionData,
) {
  return await prisma.refreshSession.create({
    data: session,
  });
}

export async function deleteSession(prisma: PrismaClient, id: string) {
  return await prisma.refreshSession.delete({ where: { id } });
}

export async function findUserByEmail(prisma: PrismaClient, email: string) {
  return prisma.user.findUnique({ where: { email } });
}
