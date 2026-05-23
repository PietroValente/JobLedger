import { describe, test, expect } from "vitest";
import { buildApp } from "../../app.js";
import { registerUser } from "../utils/test.js";
import { prisma } from "../../test/setup.js";
import { CreateCompanyType } from "./companies.schema.js";

describe("POST /companies", () => {
  test("success - register a company", async () => {
    const app = await buildApp(prisma);
    const user = await registerUser(app);

    let payload: CreateCompanyType = {
      name: "Nokia",
    };

    let res = await app.inject({
      method: "POST",
      url: "/companies",
      headers: {
        authorization: `Bearer ${user.accessToken}`,
      },
      payload,
    });

    let body = res.json();
    expect(body).toMatchObject({
      name: "Nokia",
      website: null,
      location: null,
      notes: null,
    });

    payload = {
      name: "Structure Financial",
      location: "France",
      notes: "Startup",
    };

    res = await app.inject({
      method: "POST",
      url: "/companies",
      headers: {
        authorization: `Bearer ${user.accessToken}`,
      },
      payload,
    });

    body = res.json();
    expect(body).toMatchObject({
      name: "Structure Financial",
      website: null,
      location: "France",
      notes: "Startup",
    });
  });

  test("fail  bad input", async () => {});
});

describe("GET /companies", () => {
  test("success - get list of companies", async () => {
    const app = await buildApp(prisma);
    const user = await registerUser(app);

    let payload: CreateCompanyType = {
      name: "Nokia",
    };

    await app.inject({
      method: "POST",
      url: "/companies",
      headers: {
        authorization: `Bearer ${user.accessToken}`,
      },
      payload,
    });

    payload = {
      name: "Structure Financial",
      location: "France",
      notes: "Startup",
    };

    await app.inject({
      method: "POST",
      url: "/companies",
      headers: {
        authorization: `Bearer ${user.accessToken}`,
      },
      payload,
    });

    const res = await app.inject({
      method: "GET",
      url: "/companies",
      headers: {
        authorization: `Bearer ${user.accessToken}`,
      },
    });

    const body = res.json();
    expect(body).toMatchObject([
      { name: "Nokia", website: null, location: null, notes: null },
      {
        name: "Structure Financial",
        website: null,
        location: "France",
        notes: "Startup",
      },
    ]);
  });
});
