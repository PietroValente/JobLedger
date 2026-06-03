import { describe, test, expect } from "vitest";
import { buildApp } from "../../app.js";
import { registerUser, getInvalidAccessToken } from "../utils/test.js";
import { prisma } from "../../test/setup.js";
import { CreateCompanyType } from "./companies.schema.js";

async function createCompany(
  app: Awaited<ReturnType<typeof buildApp>>,
  accessToken: string,
  payload: CreateCompanyType,
) {
  const res = await app.inject({
    method: "POST",
    url: "/companies",
    headers: { authorization: `Bearer ${accessToken}` },
    payload,
  });
  return res;
}

describe("POST /companies", () => {
  test("creates a company with all fields", async () => {
    const app = await buildApp(prisma);
    const user = await registerUser(app);

    const res = await createCompany(app, user.accessToken, {
      name: "Nokia",
      website: "https://nokia.com",
      location: "Finland",
      notes: "Telecom giant",
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      name: "Nokia",
      website: "https://nokia.com",
      location: "Finland",
      notes: "Telecom giant",
    });
    expect(res.json().id).toBeDefined();
  });

  test("creates a company with only required fields", async () => {
    const app = await buildApp(prisma);
    const user = await registerUser(app);

    const res = await createCompany(app, user.accessToken, { name: "Acme" });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      name: "Acme",
      website: null,
      location: null,
      notes: null,
    });
  });

  test("returns 401 without auth token", async () => {
    const app = await buildApp(prisma);

    const res = await app.inject({
      method: "POST",
      url: "/companies",
      payload: { name: "Nokia" },
    });

    expect(res.statusCode).toBe(401);
  });

  test("returns 401 with invalid auth token", async () => {
    const app = await buildApp(prisma);

    const res = await app.inject({
      method: "POST",
      url: "/companies",
      headers: { authorization: `Bearer ${getInvalidAccessToken()}` },
      payload: { name: "Nokia" },
    });

    expect(res.statusCode).toBe(401);
  });

  test("returns 400 with missing name", async () => {
    const app = await buildApp(prisma);
    const user = await registerUser(app);

    const res = await app.inject({
      method: "POST",
      url: "/companies",
      headers: { authorization: `Bearer ${user.accessToken}` },
      payload: {},
    });

    expect(res.statusCode).toBe(400);
  });
});

describe("GET /companies", () => {
  test("returns only the authenticated user's companies", async () => {
    const app = await buildApp(prisma);
    const userA = await registerUser(app);
    const userB = await registerUser(app);

    await createCompany(app, userA.accessToken, { name: "Nokia" });
    await createCompany(app, userA.accessToken, { name: "Samsung" });
    await createCompany(app, userB.accessToken, { name: "Apple" });

    const res = await app.inject({
      method: "GET",
      url: "/companies",
      headers: { authorization: `Bearer ${userA.accessToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveLength(2);
    expect(body.map((c: any) => c.name)).toEqual(
      expect.arrayContaining(["Nokia", "Samsung"]),
    );
    expect(body.map((c: any) => c.name)).not.toContain("Apple");
  });

  test("returns empty array when user has no companies", async () => {
    const app = await buildApp(prisma);
    const user = await registerUser(app);

    const res = await app.inject({
      method: "GET",
      url: "/companies",
      headers: { authorization: `Bearer ${user.accessToken}` },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });

  test("returns 401 without auth token", async () => {
    const app = await buildApp(prisma);

    const res = await app.inject({ method: "GET", url: "/companies" });

    expect(res.statusCode).toBe(401);
  });
});

describe("GET /companies/:id", () => {
  test("returns the company by id", async () => {
    const app = await buildApp(prisma);
    const user = await registerUser(app);

    const { id } = (await createCompany(app, user.accessToken, { name: "Nokia" })).json();

    const res = await app.inject({
      method: "GET",
      url: `/companies/${id}`,
      headers: { authorization: `Bearer ${user.accessToken}` },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ id, name: "Nokia" });
  });

  test("returns 404 when company belongs to another user", async () => {
    const app = await buildApp(prisma);
    const userA = await registerUser(app);
    const userB = await registerUser(app);

    const { id } = (await createCompany(app, userA.accessToken, { name: "Nokia" })).json();

    const res = await app.inject({
      method: "GET",
      url: `/companies/${id}`,
      headers: { authorization: `Bearer ${userB.accessToken}` },
    });

    expect(res.statusCode).toBe(404);
  });

  test("returns 404 for non-existent id", async () => {
    const app = await buildApp(prisma);
    const user = await registerUser(app);

    const res = await app.inject({
      method: "GET",
      url: "/companies/00000000-0000-0000-0000-000000000000",
      headers: { authorization: `Bearer ${user.accessToken}` },
    });

    expect(res.statusCode).toBe(404);
  });
});

describe("PUT /companies/:id", () => {
  test("updates allowed fields", async () => {
    const app = await buildApp(prisma);
    const user = await registerUser(app);

    const { id } = (await createCompany(app, user.accessToken, { name: "Nokia" })).json();

    const res = await app.inject({
      method: "PUT",
      url: `/companies/${id}`,
      headers: { authorization: `Bearer ${user.accessToken}` },
      payload: { website: "https://nokia.com", location: "Finland" },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      id,
      name: "Nokia",
      website: "https://nokia.com",
      location: "Finland",
    });
  });

  test("returns 404 when updating another user's company", async () => {
    const app = await buildApp(prisma);
    const userA = await registerUser(app);
    const userB = await registerUser(app);

    const { id } = (await createCompany(app, userA.accessToken, { name: "Nokia" })).json();

    const res = await app.inject({
      method: "PUT",
      url: `/companies/${id}`,
      headers: { authorization: `Bearer ${userB.accessToken}` },
      payload: { notes: "hacked" },
    });

    expect(res.statusCode).toBe(404);
  });

  test("returns 401 without auth token", async () => {
    const app = await buildApp(prisma);

    const res = await app.inject({
      method: "PUT",
      url: "/companies/some-id",
      payload: { notes: "test" },
    });

    expect(res.statusCode).toBe(401);
  });
});

describe("DELETE /companies/:id", () => {
  test("deletes the company", async () => {
    const app = await buildApp(prisma);
    const user = await registerUser(app);

    const { id } = (await createCompany(app, user.accessToken, { name: "Nokia" })).json();

    const deleteRes = await app.inject({
      method: "DELETE",
      url: `/companies/${id}`,
      headers: { authorization: `Bearer ${user.accessToken}` },
    });

    expect(deleteRes.statusCode).toBe(200);

    const getRes = await app.inject({
      method: "GET",
      url: `/companies/${id}`,
      headers: { authorization: `Bearer ${user.accessToken}` },
    });

    expect(getRes.statusCode).toBe(404);
  });

  test("returns 404 when deleting another user's company", async () => {
    const app = await buildApp(prisma);
    const userA = await registerUser(app);
    const userB = await registerUser(app);

    const { id } = (await createCompany(app, userA.accessToken, { name: "Nokia" })).json();

    const res = await app.inject({
      method: "DELETE",
      url: `/companies/${id}`,
      headers: { authorization: `Bearer ${userB.accessToken}` },
    });

    expect(res.statusCode).toBe(404);
  });

  test("returns 401 without auth token", async () => {
    const app = await buildApp(prisma);

    const res = await app.inject({
      method: "DELETE",
      url: "/companies/some-id",
    });

    expect(res.statusCode).toBe(401);
  });
});
