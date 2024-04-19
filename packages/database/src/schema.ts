import { bigint, pgTable } from "drizzle-orm/pg-core";

export const servers = pgTable("servers", {
  id: bigint("id", { mode: "bigint" }).primaryKey(),
  channel: bigint("channel", { mode: "bigint" }).notNull(),
  role: bigint("role", { mode: "bigint" }),
});

export type Server = typeof servers.$inferSelect;
export type NewServer = typeof servers.$inferInsert;
