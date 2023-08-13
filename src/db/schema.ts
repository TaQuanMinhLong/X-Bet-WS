import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import type { InferModel } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").unique().notNull(),
  totalMatches: integer("total_matches").default(0).notNull(),
  totalWins: integer("total_wins").default(0).notNull(),
});

export type UserProfile = InferModel<typeof users, "select">;

export type User = Omit<UserProfile, "totalMatches" | "totalWins">;

export type UpsertUserInput = InferModel<typeof users, "insert">;
