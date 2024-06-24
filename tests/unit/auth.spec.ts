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
const firstName = "test";
const lastName = "test";

const createTestUser = async (db: PostgresJsDatabase) => {
  const encryptedPassword = await bcrypt.hash(password, 10);
  await db.insert(users).values({ username, password: encryptedPassword, firstName: "test", lastName: "test" }).execute();
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

beforeAll(async () => {
  agent = request.agent(app);
  await createTestUser(db);
  // console.log(app.address);
}, 100000);

describe("Auth", async () => {
  it("should return 401 if not logged in", async () => {
    await request(app).get("/api/user").expect(401);
  });

  it("should login correctly", async (done) => {
    await agent
      .post("/api/login")
      .send({ username, password })
      .expect(200)
      .expect("set-cookie", /token=/);
  });

  it("should return user data", async () => {
    await agent
      .get("/api/user")
      .expect(200)
      .then((res) => {
        expect(res.body.username).toBe(username);
        expect(res.body.password).toBeUndefined();
        expect(res.body.id).toBeDefined();
        expect(res.body.firstName).toBe(firstName);
        expect(res.body.lastName).toBe(lastName);
        expect(res.body.followers).toEqual([]);
        expect(res.body.following).toEqual([]);
      });
  });

  it("refreshtoken should work", async () => {
    process.env.SESSION_LENGTH = "1000";
    const newApp = (await import("../../src/api/index")).default;
    const refreshTokenAgent = request.agent(newApp);
    await refreshTokenAgent.post("/api/login").send({ username, password }).expect(200);
    await sleep(1000);
    await refreshTokenAgent.get("/api/user").expect(401);
    await refreshTokenAgent
      .get("/api/refresh-token")
      .expect(200)
      .expect("set-cookie", /token=/);
    await refreshTokenAgent.get("/api/user").expect(200);
  });
});
