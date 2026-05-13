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

let client = await prismaClient.user.create({
    data: {
        name: "Pietro",
        surname: "Valente",
        email: "ciao@ciao.com",
        password: "secret password",
    }
});

console.log(client);

await app.listen({
    port: 8080
});

process.on("SIGINT", async () => {
  await app.close();
  process.exit(0);
});