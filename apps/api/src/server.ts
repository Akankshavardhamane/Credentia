import { buildApp } from "./app.js";
const app = buildApp();
await app.listen({
  port: Number(process.env.API_PORT ?? 3001),
  host: "0.0.0.0",
});
