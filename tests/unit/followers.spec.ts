import { afterAll, afterEach, beforeAll, describe, expect, inject, it, test, vi } from "vitest";
import request from "supertest";
import { followers, users } from "../../src/api/db/schema";
import TestAgent from "supertest/lib/agent";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import bcrypt from "bcrypt";
import { createMockDb, createTestUser } from "../utils";
import { UserSession } from "../../src/api/types";

let user: UserSession & { password: string };
let testDb: PostgresJsDatabase;
let app;

beforeAll(async () => {
  const { db, postgresContainer, queryClient } = await createMockDb();
  //   user = await createTestUser(db);
  testDb = db;
  process.env.PORT = "3003";
  process.env.DB_CONNECTION_STRING = postgresContainer.getConnectionUri();
  app = (await import("../../src/api/index")).default;

  return async () => {
    await postgresContainer.stop();
    await queryClient.end();
  };
}, 100000);

afterEach(async () => {
  await testDb.delete(users).execute();
  await testDb.delete(followers).execute();
});

describe("Followers", async () => {
  it("should follow user", async () => {
    const user1 = await createTestUser(testDb, { username: "test1", firstName: "test1" });
    const user2 = await createTestUser(testDb, { username: "test2", firstName: "test2" });
    const user1Agent = request.agent(app);
    await user1Agent.post(`/api/login`).send({ username: user1.username, password: user1.password }).expect(200);
    await user1Agent.put(`/api/followers/follow/${user2.id}`).expect(200);
    await user1Agent
      .get("/api/user")
      .expect(200)
      .then((res) => {
        expect(res.body.following).toHaveLength(1);
        expect(res.body.following[0].id).toEqual(user2.id);
        expect(res.body.followers).toHaveLength(0);
      });
    const user2Agent = request.agent(app);
    await user2Agent.post(`/api/login`).send({ username: user2.username, password: user2.password }).expect(200);
    await user2Agent
      .get(`/api/user`)
      .expect(200)
      .then((res) => {
        expect(res.body.followers).toHaveLength(1);
        expect(res.body.followers[0].id).toEqual(user1.id);
        expect(res.body.following).toHaveLength(0);
      });
  });

  it("should unfollow user", async () => {
    const user1 = await createTestUser(testDb, { username: "test1", firstName: "test1" });
    const user2 = await createTestUser(testDb, { username: "test2", firstName: "test2" });
    const user1Agent = request.agent(app);
    await user1Agent.post(`/api/login`).send({ username: user1.username, password: user1.password }).expect(200);
    await user1Agent.put(`/api/followers/follow/${user2.id}`).expect(200);
    await user1Agent
      .get("/api/user")
      .expect(200)
      .then((res) => {
        expect(res.body.following).toHaveLength(1);
        expect(res.body.followers).toHaveLength(0);
      });
    await user1Agent.delete(`/api/followers/unfollow/${user2.id}`).expect(200);
    await user1Agent
      .get("/api/user")
      .expect(200)
      .then((res) => {
        expect(res.body.following).toHaveLength(0);
        expect(res.body.followers).toHaveLength(0);
      });
  });
});
