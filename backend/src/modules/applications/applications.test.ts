import { describe, test, expect } from "vitest";
import { buildApp } from "../../app.js";
import { registerUser, getInvalidAccessToken } from "../utils/test.js";
import { prisma } from "../../test/setup.js";
import { CreateApplicationType } from "./applications.schema.js";
import { CreateCompanyType } from "../companies/companies.schema.js";

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

async function createApplication(
  app: Awaited<ReturnType<typeof buildApp>>,
  accessToken: string,
  companyId: string,
  payload: CreateApplicationType,
) {
  const res = await app.inject({
    method: "POST",
    url: `/companies/${companyId}/applications`,
    headers: { authorization: `Bearer ${accessToken}` },
    payload,
  });
  return res;
}

describe("POST /companies/:companyId/applications", () => {
  test("creates an application with all fields", async () => {
    const app = await buildApp(prisma);
    const user = await registerUser(app);
    const { id: companyId } = (
      await createCompany(app, user.accessToken, { name: "Nokia" })
    ).json();

    const res = await createApplication(app, user.accessToken, companyId, {
      role: "Software Engineer",
      status: "applied",
      jobUrl: "https://jobs.nokia.com/1",
      description: "Backend role",
      notes: "Referral from John",
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      role: "Software Engineer",
      status: "applied",
      jobUrl: "https://jobs.nokia.com/1",
      description: "Backend role",
      notes: "Referral from John",
    });
    expect(res.json().id).toBeDefined();
  });

  test("creates an application with only required fields", async () => {
    const app = await buildApp(prisma);
    const user = await registerUser(app);
    const { id: companyId } = (
      await createCompany(app, user.accessToken, { name: "Nokia" })
    ).json();

    const res = await createApplication(app, user.accessToken, companyId, {
      role: "Designer",
      status: "applied",
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      role: "Designer",
      status: "applied",
      jobUrl: null,
      description: null,
      notes: null,
    });
  });

  test("returns 400 when body is missing required fields", async () => {
    const app = await buildApp(prisma);
    const user = await registerUser(app);
    const { id: companyId } = (
      await createCompany(app, user.accessToken, { name: "Nokia" })
    ).json();

    const res = await app.inject({
      method: "POST",
      url: `/companies/${companyId}/applications`,
      headers: { authorization: `Bearer ${user.accessToken}` },
      payload: {},
    });

    expect(res.statusCode).toBe(400);
  });

  test("returns 404 when company belongs to another user", async () => {
    const app = await buildApp(prisma);
    const userA = await registerUser(app);
    const userB = await registerUser(app);
    const { id: companyId } = (
      await createCompany(app, userA.accessToken, { name: "Nokia" })
    ).json();

    const res = await createApplication(app, userB.accessToken, companyId, {
      role: "Engineer",
      status: "applied",
    });

    expect(res.statusCode).toBe(404);
  });

  test("returns 401 without auth token", async () => {
    const app = await buildApp(prisma);

    const res = await app.inject({
      method: "POST",
      url: "/companies/some-id/applications",
      payload: { role: "Engineer", status: "applied" },
    });

    expect(res.statusCode).toBe(401);
  });

  test("returns 401 with invalid auth token", async () => {
    const app = await buildApp(prisma);

    const res = await app.inject({
      method: "POST",
      url: "/companies/some-id/applications",
      headers: { authorization: `Bearer ${getInvalidAccessToken()}` },
      payload: { role: "Engineer", status: "applied" },
    });

    expect(res.statusCode).toBe(401);
  });
});

describe("GET /companies/:companyId/applications", () => {
  test("returns all applications for the company", async () => {
    const app = await buildApp(prisma);
    const user = await registerUser(app);
    const { id: companyId } = (
      await createCompany(app, user.accessToken, { name: "Nokia" })
    ).json();

    await createApplication(app, user.accessToken, companyId, {
      role: "Engineer",
      status: "applied",
    });
    await createApplication(app, user.accessToken, companyId, {
      role: "Designer",
      status: "interview",
    });

    const res = await app.inject({
      method: "GET",
      url: `/companies/${companyId}/applications`,
      headers: { authorization: `Bearer ${user.accessToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveLength(2);
    expect(body.map((a: any) => a.role)).toEqual(
      expect.arrayContaining(["Engineer", "Designer"]),
    );
  });

  test("returns empty array when company has no applications", async () => {
    const app = await buildApp(prisma);
    const user = await registerUser(app);
    const { id: companyId } = (
      await createCompany(app, user.accessToken, { name: "Nokia" })
    ).json();

    const res = await app.inject({
      method: "GET",
      url: `/companies/${companyId}/applications`,
      headers: { authorization: `Bearer ${user.accessToken}` },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });

  test("does not return applications of another user's company", async () => {
    const app = await buildApp(prisma);
    const userA = await registerUser(app);
    const userB = await registerUser(app);
    const { id: companyId } = (
      await createCompany(app, userA.accessToken, { name: "Nokia" })
    ).json();

    await createApplication(app, userA.accessToken, companyId, {
      role: "Engineer",
      status: "applied",
    });

    const res = await app.inject({
      method: "GET",
      url: `/companies/${companyId}/applications`,
      headers: { authorization: `Bearer ${userB.accessToken}` },
    });

    expect(res.statusCode).toBe(404);
  });

  test("returns 401 without auth token", async () => {
    const app = await buildApp(prisma);

    const res = await app.inject({
      method: "GET",
      url: "/companies/some-id/applications",
    });

    expect(res.statusCode).toBe(401);
  });
});

describe("GET /companies/:companyId/applications/:applicationId", () => {
  test("returns the application by id", async () => {
    const app = await buildApp(prisma);
    const user = await registerUser(app);
    const { id: companyId } = (
      await createCompany(app, user.accessToken, { name: "Nokia" })
    ).json();
    const { id: applicationId } = (
      await createApplication(app, user.accessToken, companyId, {
        role: "Engineer",
        status: "applied",
      })
    ).json();

    const res = await app.inject({
      method: "GET",
      url: `/companies/${companyId}/applications/${applicationId}`,
      headers: { authorization: `Bearer ${user.accessToken}` },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ id: applicationId, role: "Engineer" });
  });

  test("returns 404 for non-existent application id", async () => {
    const app = await buildApp(prisma);
    const user = await registerUser(app);
    const { id: companyId } = (
      await createCompany(app, user.accessToken, { name: "Nokia" })
    ).json();

    const res = await app.inject({
      method: "GET",
      url: `/companies/${companyId}/applications/999999`,
      headers: { authorization: `Bearer ${user.accessToken}` },
    });

    expect(res.statusCode).toBe(404);
  });

  test("returns 404 when application belongs to another user", async () => {
    const app = await buildApp(prisma);
    const userA = await registerUser(app);
    const userB = await registerUser(app);
    const { id: companyId } = (
      await createCompany(app, userA.accessToken, { name: "Nokia" })
    ).json();
    const { id: applicationId } = (
      await createApplication(app, userA.accessToken, companyId, {
        role: "Engineer",
        status: "applied",
      })
    ).json();

    const res = await app.inject({
      method: "GET",
      url: `/companies/${companyId}/applications/${applicationId}`,
      headers: { authorization: `Bearer ${userB.accessToken}` },
    });

    expect(res.statusCode).toBe(404);
  });

  test("returns 401 without auth token", async () => {
    const app = await buildApp(prisma);

    const res = await app.inject({
      method: "GET",
      url: "/companies/some-id/applications/1",
    });

    expect(res.statusCode).toBe(401);
  });
});

describe("PUT /companies/:companyId/applications/:applicationId", () => {
  test("updates allowed fields", async () => {
    const app = await buildApp(prisma);
    const user = await registerUser(app);
    const { id: companyId } = (
      await createCompany(app, user.accessToken, { name: "Nokia" })
    ).json();
    const { id: applicationId } = (
      await createApplication(app, user.accessToken, companyId, {
        role: "Engineer",
        status: "applied",
      })
    ).json();

    const res = await app.inject({
      method: "PUT",
      url: `/companies/${companyId}/applications/${applicationId}`,
      headers: { authorization: `Bearer ${user.accessToken}` },
      payload: { status: "interview", notes: "Phone screen scheduled" },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      id: applicationId,
      role: "Engineer",
      status: "interview",
      notes: "Phone screen scheduled",
    });
  });

  test("returns 404 when updating another user's application", async () => {
    const app = await buildApp(prisma);
    const userA = await registerUser(app);
    const userB = await registerUser(app);
    const { id: companyId } = (
      await createCompany(app, userA.accessToken, { name: "Nokia" })
    ).json();
    const { id: applicationId } = (
      await createApplication(app, userA.accessToken, companyId, {
        role: "Engineer",
        status: "applied",
      })
    ).json();

    const res = await app.inject({
      method: "PUT",
      url: `/companies/${companyId}/applications/${applicationId}`,
      headers: { authorization: `Bearer ${userB.accessToken}` },
      payload: { notes: "hacked" },
    });

    expect(res.statusCode).toBe(404);
  });

  test("returns 401 without auth token", async () => {
    const app = await buildApp(prisma);

    const res = await app.inject({
      method: "PUT",
      url: "/companies/some-id/applications/1",
      payload: { status: "interview" },
    });

    expect(res.statusCode).toBe(401);
  });
});

describe("DELETE /companies/:companyId/applications/:applicationId", () => {
  test("deletes the application", async () => {
    const app = await buildApp(prisma);
    const user = await registerUser(app);
    const { id: companyId } = (
      await createCompany(app, user.accessToken, { name: "Nokia" })
    ).json();
    const { id: applicationId } = (
      await createApplication(app, user.accessToken, companyId, {
        role: "Engineer",
        status: "applied",
      })
    ).json();

    const deleteRes = await app.inject({
      method: "DELETE",
      url: `/companies/${companyId}/applications/${applicationId}`,
      headers: { authorization: `Bearer ${user.accessToken}` },
    });

    expect(deleteRes.statusCode).toBe(200);

    const getRes = await app.inject({
      method: "GET",
      url: `/companies/${companyId}/applications/${applicationId}`,
      headers: { authorization: `Bearer ${user.accessToken}` },
    });

    expect(getRes.statusCode).toBe(404);
  });

  test("returns 404 when deleting another user's application", async () => {
    const app = await buildApp(prisma);
    const userA = await registerUser(app);
    const userB = await registerUser(app);
    const { id: companyId } = (
      await createCompany(app, userA.accessToken, { name: "Nokia" })
    ).json();
    const { id: applicationId } = (
      await createApplication(app, userA.accessToken, companyId, {
        role: "Engineer",
        status: "applied",
      })
    ).json();

    const res = await app.inject({
      method: "DELETE",
      url: `/companies/${companyId}/applications/${applicationId}`,
      headers: { authorization: `Bearer ${userB.accessToken}` },
    });

    expect(res.statusCode).toBe(404);
  });

  test("returns 401 without auth token", async () => {
    const app = await buildApp(prisma);

    const res = await app.inject({
      method: "DELETE",
      url: "/companies/some-id/applications/1",
    });

    expect(res.statusCode).toBe(401);
  });
});
