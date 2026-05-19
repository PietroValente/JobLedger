import { beforeAll, afterAll, beforeEach } from "vitest";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { PrismaPg } from "@prisma/adapter-pg";

let container: Awaited<ReturnType<PostgreSqlContainer["start"]>>;

export let prisma: PrismaClient;

beforeAll(async () => {
  container = await new PostgreSqlContainer("postgres:16")
    .withDatabase("test")
    .withUsername("test")
    .withPassword("test")
    .start();

  const databaseUrl = container.getConnectionUri();

  process.env.DATABASE_URL = databaseUrl;

  execSync("npx prisma migrate deploy", {
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
    stdio: "inherit",
  });

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  prisma = new PrismaClient({
    adapter,
  });

  await prisma.$connect();
}, 30_000);

beforeEach(async () => {
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname='public'
  `;

  const tables = tablenames
    .map(({ tablename }) => `"public"."${tablename}"`)
    .filter((name) => name !== '"public"."_prisma_migrations"')
    .join(", ");

  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
});

afterAll(async () => {
  await prisma.$disconnect();
  await container.stop();
});
