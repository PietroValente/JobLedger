import { Prisma } from "@prisma/client";
import {
  createUser,
  CreateUserInput,
  deleteSession,
  findUserByEmail,
} from "./auth.repository.js";
import { LoginInputType, RegisterInputType } from "./auth.schema.js";
import argon2 from "argon2";
import { FastifyInstance, FastifyReply } from "fastify";
import { login, verifyRefreshToken } from "../utils/token.js";

export async function getCurrentUser(app: FastifyInstance, email: string) {
  const user = await findUserByEmail(app.prisma, email);

  if (!user) {
    throw app.httpErrors.notFound("User not found");
  }

  return user;
}

export async function verifyLoginUser(
  app: FastifyInstance,
  data: LoginInputType,
) {
  const user = await findUserByEmail(app.prisma, data.email);

  if (!user) {
    throw app.httpErrors.unauthorized("Invalid credentials");
  }

  const validPassword = await argon2.verify(user.passwordHash, data.password);

  if (!validPassword) {
    throw app.httpErrors.unauthorized("Invalid credentials");
  }
  return user;
}

export async function registerUser(
  app: FastifyInstance,
  data: RegisterInputType,
) {
  const passwordHash = await argon2.hash(data.password);

  try {
    const input: CreateUserInput = {
      name: data.name,
      surname: data.surname,
      email: data.email,
      passwordHash,
    };
    const user = await createUser(app.prisma, input);
    return user;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw app.httpErrors.conflict("Email already exists");
    }

    throw error;
  }
}

export async function refreshAccessToken(
  app: FastifyInstance,
  reply: FastifyReply,
  token: string | undefined,
) {
  if (!token) {
    throw app.httpErrors.unauthorized("Missing refresh token");
  }

  const [sessionId, secret] = token.split(".");

  if (!sessionId || !secret) {
    throw app.httpErrors.unauthorized("Invalid refresh token");
  }

  const session = await app.prisma.refreshSession.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    throw app.httpErrors.unauthorized("Invalid refresh token");
  }

  const user = session.user;
  const valid = await verifyRefreshToken(session.tokenHash, secret);

  if (!valid) {
    throw app.httpErrors.unauthorized("Invalid refresh token");
  }

  await deleteSession(app.prisma, sessionId);

  return await login({
    app,
    reply,
    user,
  });
}

export async function logoutUser(
  app: FastifyInstance,
  token: string | undefined,
) {
  if (!token) {
    return;
  }

  const [sessionId] = token.split(".");

  if (!sessionId) {
    return;
  }

  await app.prisma.refreshSession.deleteMany({
    where: { id: sessionId },
  });
}
