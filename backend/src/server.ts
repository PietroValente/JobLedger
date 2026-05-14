import { buildApp } from "./app.js";

let app = await buildApp();

await app.listen({
  port: 3000,
  host: "0.0.0.0",
});

process.on("SIGINT", async () => {
  await app.close();
  process.exit(0);
});