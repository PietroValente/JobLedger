import { FastifyInstance, FastifyRequest } from "fastify";
import {
  logoutUser,
  refreshAccessToken,
  registerUser,
  verifyLoginUser,
} from "./auth.service.js";
import {
  LoginInputSchema,
  LoginInputType,
  LoginOutputSchema,
  RegisterInputSchema,
  RegisterInputType,
  RegisterOutputSchema,
} from "./auth.schema.js";
import { login, LoginData } from "../utils/token.js";

export async function authRoutes(app: FastifyInstance) {
  app.get(
    "/me",
    {
      preHandler: [app.authenticate],
    },
    async (request) => {
      return request.user;
    },
  );

  app.post(
    "/login",
    {
      schema: {
        body: LoginInputSchema,
        response: {
          200: LoginOutputSchema,
        },
      },
    },
    async (request: FastifyRequest<{ Body: LoginInputType }>, reply) => {
      const user = await verifyLoginUser(app, request.body);

      reply.status(200);
      const data: LoginData = {
        app,
        reply,
        user,
      };
      await login(data);
    },
  );

  app.post(
    "/register",
    {
      schema: {
        body: RegisterInputSchema,
        response: {
          201: RegisterOutputSchema,
        },
      },
    },
    async (request: FastifyRequest<{ Body: RegisterInputType }>, reply) => {
      let user = await registerUser(app, request.body);

      reply.status(201);
      const data: LoginData = {
        app,
        reply,
        user,
      };
      await login(data);
    },
  );

  app.post("/refresh", async (request, reply) => {
    const accessToken = await refreshAccessToken(
      app,
      request.cookies.refreshToken,
    );

    return reply.status(200).send({ accessToken });
  });

  app.post("/logout", async (request, reply) => {
    await logoutUser(app, request.cookies.refreshToken);

    reply.clearCookie("refreshToken", {
      path: "/auth",
    });

    return reply.status(200).send({ success: true });
  });
}
