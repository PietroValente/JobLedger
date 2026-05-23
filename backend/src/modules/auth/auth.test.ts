import { describe, test, expect } from "vitest";
import { prisma } from "../../test/setup.js";
import { buildApp } from "../../app.js";
import { faker } from "@faker-js/faker";
import {
  getCookies,
  getInvalidAccessToken,
  registerUser,
} from "../utils/test.js";
import { RegisterInputType } from "./auth.schema.js";

describe("POST /auth/register", () => {
  test("success - register a user", async () => {
    const app = await buildApp(prisma);

    const name = faker.person.firstName();
    const surname = faker.person.lastName();
    const email = faker.internet.email();

    const payload: RegisterInputType = {
      name,
      surname,
      email,
      password: faker.internet.email(),
    };

    const res = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload,
    });

    expect(res.statusCode).toBe(201);

    const body = res.json();
    expect(body).toMatchObject({
      accessToken: expect.any(String),
      user: {
        name,
        surname,
        email,
      },
    });
  });

  test("fail - bad input", async () => {
    const app = await buildApp(prisma);

    let payload = {
      name: faker.person.firstName(),
      surname: faker.person.lastName(),
      email: faker.internet.email(),
      password: "short",
    };

    let res = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload,
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().message).toBe(
      "body/password Too small: expected string to have >=8 characters",
    );

    payload = {
      name: faker.person.firstName(),
      surname: faker.person.lastName(),
      email: "wrong",
      password: faker.internet.password(),
    };

    res = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload,
    });

    expect(res.statusCode).toBe(400);
    console.log(res.json());
    expect(res.json().message).toBe("body/email Invalid email address");

    payload = {
      name: "",
      surname: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    res = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload,
    });

    expect(res.statusCode).toBe(400);
    console.log(res.json());
    expect(res.json().message).toBe(
      "body/name Too small: expected string to have >=1 characters",
    );
  });
});

describe("GET /auth/me", () => {
  test("success - get the user", async () => {
    const app = await buildApp(prisma);

    const user = await registerUser(app);

    const res = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: {
        authorization: `Bearer ${user.accessToken}`,
      },
    });

    expect(res.statusCode).toBe(200);

    const body = res.json();
    expect(body).toMatchObject({
      name: user.name,
      surname: user.surname,
      email: user.email,
    });
  });

  test("fail - invalid access token", async () => {
    const app = await buildApp(prisma);

    const user = await registerUser(app);

    const res = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: {
        authorization: `Bearer ${getInvalidAccessToken()}`,
      },
    });

    console.log(res.json());
    expect(res.statusCode).toBe(401);
    expect(res.json().message).toBe("Invalid access token");
  });
});

describe("POST /auth/login - /auth/logout", () => {
  test("success - register, logout invalidates refresh cookie, login works again", async () => {
    const app = await buildApp(prisma);
    const user = await registerUser(app);

    const logoutRes = await app.inject({
      method: "POST",
      url: "/auth/logout",
      headers: {
        authorization: `Bearer ${user.accessToken}`,
        cookie: user.refreshCookie,
      },
    });

    expect(logoutRes.statusCode).toBe(200);

    const logoutCookies = getCookies(logoutRes);

    expect(logoutCookies.length).toBeGreaterThan(0);

    const clearedCookie = logoutCookies.find((c) =>
      c.startsWith("refreshToken="),
    );

    expect(clearedCookie).toBeDefined();
    expect(
      clearedCookie!.includes("Max-Age=0") ||
        clearedCookie!.includes("Expires="),
    ).toBe(true);

    const meRes = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: {
        authorization: `Bearer ${user.accessToken}`,
      },
    });

    expect(meRes.statusCode).toBe(200);

    const loginRes = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: user.email,
        password: user.password,
      },
    });

    expect(loginRes.statusCode).toBe(200);

    const loginBody = loginRes.json();

    expect(loginBody).toMatchObject({
      accessToken: expect.any(String),
      user: {
        email: user.email,
        name: user.name,
        surname: user.surname,
      },
    });

    const loginCookies = getCookies(loginRes);

    expect(loginCookies.some((c) => c.startsWith("refreshToken="))).toBe(true);
  });

  test("fail - login with wrong password", async () => {
    const app = await buildApp(prisma);

    const user = await registerUser(app);

    const res = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: user.email,
        password: "wrong-password",
      },
    });

    expect(res.statusCode).toBe(401);

    const body = res.json();
    expect(body).toMatchObject({
      message: "Invalid credentials",
    });
  });

  test("fail - logout without auth", async () => {
    const app = await buildApp(prisma);

    const res = await app.inject({
      method: "POST",
      url: "/auth/logout",
    });

    expect(res.statusCode).toBe(401);
  });
});

describe("POST /auth/refresh", () => {
  test("success - refresh rotates tokens", async () => {
    const app = await buildApp(prisma);

    const user = await registerUser(app);

    const refreshCookie = user.refreshCookie;

    const res = await app.inject({
      method: "POST",
      url: "/auth/refresh",
      headers: {
        cookie: refreshCookie,
      },
    });

    expect(res.statusCode).toBe(200);

    const body = res.json();

    expect(body).toMatchObject({
      accessToken: expect.any(String),
    });

    const cookies = getCookies(res);

    expect(cookies.some((c) => c.startsWith("refreshToken="))).toBe(true);
  });

  test("fail - refresh without cookie", async () => {
    const app = await buildApp(prisma);

    const res = await app.inject({
      method: "POST",
      url: "/auth/refresh",
    });

    expect(res.statusCode).toBe(401);
  });

  test("fail - refresh with invalid cookie", async () => {
    const app = await buildApp(prisma);

    const res = await app.inject({
      method: "POST",
      url: "/auth/refresh",
      headers: {
        cookie: "refreshToken=invalid-token",
      },
    });

    expect(res.statusCode).toBe(401);
  });

  test("fail - reused refresh token after rotation", async () => {
    const app = await buildApp(prisma);

    const user = await registerUser(app);

    const res1 = await app.inject({
      method: "POST",
      url: "/auth/refresh",
      headers: {
        cookie: user.refreshCookie,
      },
    });

    expect(res1.statusCode).toBe(200);

    const cookies1 = getCookies(res1);
    const newRefresh = cookies1.find((c) => c.startsWith("refreshToken="));

    const res2 = await app.inject({
      method: "POST",
      url: "/auth/refresh",
      headers: {
        cookie: user.refreshCookie,
      },
    });

    expect(res2.statusCode).toBe(401);
  });
});
