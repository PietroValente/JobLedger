import "dotenv/config";
import fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

let app = fastify({
    logger: true
});
app.get("/ping", async () => {
    return "pong";
});

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

let prismaClient = new PrismaClient({
    adapter,
});

await app.listen({
  port: 3000,
  host: "0.0.0.0",
});

process.on("SIGINT", async () => {
  await app.close();
  process.exit(0);
});