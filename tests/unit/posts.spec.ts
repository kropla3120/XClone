import { afterAll, beforeAll, describe, expect, inject, it, test, vi } from "vitest";
import request from "supertest";
import { users } from "../../src/api/db/schema";
import TestAgent from "supertest/lib/agent";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import bcrypt from "bcrypt";
import { createMockDb, createTestUser } from "../utils";
import { UserSession } from "../../src/api/types";
// import { testWithContext } from "./setup";
// import { app, db } from "./setup";

let agent: TestAgent;

let user: UserSession & { password: string };

beforeAll(async () => {
  const { db, postgresContainer, queryClient } = await createMockDb();
  user = await createTestUser(db);
  process.env.PORT = "3002";
  process.env.DB_CONNECTION_STRING = postgresContainer.getConnectionUri();
  const app = (await import("../../src/api/index")).default;
  agent = request.agent(app);
  await agent.post("/api/login").send({ username: user.username, password: user.password }).expect(200);
  return async () => {
    await postgresContainer.stop();
    await queryClient.end();
  };
}, 100000);

describe("Posts", async () => {
  it("posting should work", async () => {
    await agent.post("/api/posts").send({ content: "testowy post" }).expect(201);
    await agent
      .get("/api/posts")
      .expect(200)
      .then((res) => {
        expect(res.body[0].content).toBe("testowy post");
        expect(res.body[0].user.username).toBe(user.username);
      });
  });
  it("Editing post should work", async () => {
    await agent.put("/api/posts/1").send({ content: "zmieniony post" }).expect(200);
    await agent
      .get("/api/posts")
      .expect(200)
      .then((res) => {
        expect(res.body[0].content).toBe("zmieniony post");
        expect(res.body[0].user.username).toBe(user.username);
      });
  });

  it("Liking post should work", async () => {
    await agent.put("/api/posts/1/like").expect(200);
    await agent
      .get("/api/posts")
      .expect(200)
      .then((res) => {
        expect(res.body[0].likeCount).toBe(1);
        expect(res.body[0].likedByMe).toBe(true);
      });
  });
  it("Unliking post should work", async () => {
    await agent.delete("/api/posts/1/like").expect(200);
    await agent
      .get("/api/posts")
      .expect(200)
      .then((res) => {
        expect(res.body[0].likeCount).toBe(0);
        expect(res.body[0].likedByMe).toBe(false);
      });
  });
  it("Commenting should work", async () => {
    await agent.post("/api/posts").send({ content: "testowa odpowiedz", responseToPostId: 1 }).expect(201);
    await agent
      .get("/api/posts/1/responses")
      .expect(200)
      .then((res) => {
        expect(res.body[0].content).toBe("testowa odpowiedz");
        expect(res.body[0].user.username).toBe(user.username);
      });
  });
  it("Deleting post should work", async () => {
    await agent.delete("/api/posts/1").expect(200);
    await agent
      .get("/api/posts")
      .expect(200)
      .then((res) => expect(res.body.length).toBe(0));
  });
});
