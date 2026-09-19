import {
  PostgresCredentialStore,
  createDatabase,
} from "../../../packages/db/dist/index.js";
import { buildApp } from "./app.js";
const database = process.env.DATABASE_URL
  ? createDatabase(process.env.DATABASE_URL)
  : undefined;
const app = buildApp({
  credentials: database ? new PostgresCredentialStore(database.db) : undefined,
});
await app.listen({
  port: Number(process.env.API_PORT ?? 3001),
  host: "0.0.0.0",
});
