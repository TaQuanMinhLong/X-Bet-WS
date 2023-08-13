import { Database } from "bun:sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

const sqlite = new Database("./src/db/db.sqlite");

export const db = drizzle(sqlite, { schema });

migrate(db, { migrationsFolder: "./src/db/migrations" });

export * from "./schema";
export * from "./query";
