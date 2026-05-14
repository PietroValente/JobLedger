import crypto from "node:crypto";
import argon2 from "argon2";
import { FastifyInstance, FastifyReply } from "fastify";
import { createSession, CreateSessionInput } from "../auth/auth.repository.js";
import { User } from "@prisma/client";

const JWT_EXPIRES_TIME = "1m";
export const REFRESH_SESSION_EXPIRE_TIME = 60 * 5; //5minutes

export function generateRefreshToken() {
  const sessionId = crypto.randomUUID();
  const secret = crypto.randomBytes(64).toString("hex");

  return {
    sessionId,
    secret,
    token: `${sessionId}.${secret}`,
  };
}

export async function hashRefreshToken(secret: string) {
  return argon2.hash(secret);
}

export async function verifyRefreshToken(hash: string, secret: string) {
  return argon2.verify(hash, secret);
}

export function jwtSign(app: FastifyInstance, userId: number, email: string) {
  return app.jwt.sign(
    {
      sub: userId,
      email: email,
    },
    {
      expiresIn: JWT_EXPIRES_TIME,
    },
  );
}

export async function generateTokens(
  app: FastifyInstance,
  userId: number,
  email: string,
) {
  const accessToken = jwtSign(app, userId, email);
  const refresh = generateRefreshToken();
  const session: CreateSessionInput = {
    id: refresh.sessionId,
    userId: userId,
    tokenHash: await hashRefreshToken(refresh.secret),
    expiresAt: new Date(Date.now() + 1000 * REFRESH_SESSION_EXPIRE_TIME),
  };
  await createSession(app.prisma, session);
  return { accessToken, refreshToken: refresh.token };
}

export type LoginData = {
  app: FastifyInstance;
  reply: FastifyReply;
  user: User;
};

export async function login(data: LoginData) {
  const tokens = await generateTokens(data.app, data.user.id, data.user.email);
  data.reply.setCookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    path: "/auth",
    maxAge: REFRESH_SESSION_EXPIRE_TIME,
  });

  return data.reply.send({
    user: data.user,
    accessToken: tokens.accessToken,
  });
}
