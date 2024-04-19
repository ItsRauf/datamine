import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { resolve } from "node:path";
import pg from "pg";
import * as schema from "./schema.ts";

const client = new pg.Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

await client.connect();

export const database = drizzle(client, { schema });
await migrate(database, {
  migrationsFolder: resolve(import.meta.dirname, "../migrations"),
});

export * as Drizzle from "drizzle-orm";
export * as Schema from "./schema.ts";
