import { db, users } from ".";
import { test } from "bun:test";

test("Query users", () => {
  const data = db.select().from(users).all();
  console.log(data);
});
