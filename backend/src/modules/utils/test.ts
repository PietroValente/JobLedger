import { FastifyInstance } from "fastify";
import { faker } from "@faker-js/faker";

export async function registerUser(app: FastifyInstance) {
  const payload = {
    name: faker.person.firstName(),
    surname: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.email(),
  };

  const loginResponse = await app.inject({
    method: "POST",
    url: "/auth/register",
    payload,
  });

  const accessToken = loginResponse.json().accessToken;
  const setCookie = loginResponse.headers["set-cookie"];

  const refreshCookie = Array.isArray(setCookie)
    ? setCookie.find((c) => c.includes("refreshToken"))
    : setCookie;

  return { accessToken, refreshCookie, ...payload };
}

export function getInvalidAccessToken() {
  return "eyWRONGiOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsImVtYWlsIjoiSG9zZWEuQm9nYW5AaG90bWFpbC5jb20iLCJpYXQiOjE3NzkxNzgyNDgsImV4cCI6MTc3OTE3ODMwOH0.4rwJvQl-Gx6PTb3aGvdw7G6EqwLOunMkUVZ92E6FK98";
}

export function getCookies(res: any): string[] {
  const cookies = res.headers["set-cookie"];

  if (!cookies) return [];

  return Array.isArray(cookies) ? cookies : [cookies];
}
