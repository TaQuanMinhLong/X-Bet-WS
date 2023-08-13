import { UpsertUserInput, users } from "./schema";
import { eq } from "drizzle-orm";
import { db } from ".";

export const createUser = (user: UpsertUserInput) =>
  db.insert(users).values(user).returning().get();

export const updateUser = ({ username, id }: UpsertUserInput) =>
  db.update(users).set({ username }).where(eq(users.id, id)).returning().get();

export const deleteUser = (userId: string) =>
  db.delete(users).where(eq(users.id, userId)).returning().get();
