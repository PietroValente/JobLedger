import { buildApp } from "./app.js";
import { prisma } from "./modules/utils/prisma.js";

let app = await buildApp(prisma);

await app.listen({
  port: 3000,
  host: "0.0.0.0",
});

process.on("SIGINT", async () => {
  await app.close();
  process.exit(0);
});
