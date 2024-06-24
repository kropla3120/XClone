import { beforeAll, describe, expect, inject, it, test, vi } from "vitest";
import request from "supertest";
import { users } from "../../src/api/db/schema";
import TestAgent from "supertest/lib/agent";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import bcrypt from "bcrypt";
import { createMockDb } from "../utils";
import { app, db } from "./setup";

let agent: TestAgent;
const username = "test";
const password = "test12345678";

const createTestUser = async (db: PostgresJsDatabase) => {
  const encryptedPassword = await bcrypt.hash(password, 10);
  await db.insert(users).values({ username, password: encryptedPassword, firstName: "test", lastName: "test" }).execute();
};

beforeAll(async () => {
  agent = request.agent(app);
  await createTestUser(db);
  await agent.post("/api/login").send({ username, password });
}, 100000);

describe("Posts", async () => {
  it("posting should work", async () => {
    await agent.post("/api/posts").send({ content: "jakas tresc posta" }).expect(200);
  });
});
