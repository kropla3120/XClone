import { beforeAll, describe, expect, inject, it, test, vi } from "vitest";
import request from "supertest";
import TestAgent from "supertest/lib/agent";
import { createMockDb, createTestUser } from "../utils";
import { UserSession } from "../../src/api/types";

let app: any;
let agent: TestAgent;
let user: UserSession & { password: string };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

beforeAll(async () => {
  const { db, postgresContainer, queryClient } = await createMockDb();

  user = await createTestUser(db);
  process.env.PORT = "3001";
  process.env.DB_CONNECTION_STRING = postgresContainer.getConnectionUri();
  app = (await import("../../src/api/index")).default;
  agent = request.agent(app);

  return async () => {
    await postgresContainer.stop();
    await queryClient.end();
  };

  // console.log(app.address);
}, 100000);

describe("Auth", async () => {
  it("should return 401 if not logged in", async () => {
    await request(app).get("/api/user").expect(401);
  });

  it("should login correctly", async (done) => {
    await agent
      .post("/api/login")
      .send({ username: user.username, password: user.password })
      .expect(200)
      .expect("set-cookie", /token=/);
  });

  it("should return user data", async () => {
    await agent
      .get("/api/user")
      .expect(200)
      .then((res) => {
        expect(res.body.username).toBe(user.username);
        expect(res.body.password).toBeUndefined();
        expect(res.body.id).toBeDefined();
        expect(res.body.firstName).toBe(user.firstName);
        expect(res.body.lastName).toBe(user.lastName);
        expect(res.body.followers).toEqual([]);
        expect(res.body.following).toEqual([]);
      });
  });

  it("refreshtoken should work", async () => {
    process.env.SESSION_LENGTH = "1000";
    const newApp = (await import("../../src/api/index")).default;
    const refreshTokenAgent = request.agent(newApp);
    await refreshTokenAgent.post("/api/login").send({ username: user.username, password: user.password }).expect(200);
    await sleep(1000);
    await refreshTokenAgent.get("/api/user").expect(401);
    await refreshTokenAgent
      .get("/api/refresh-token")
      .expect(200)
      .expect("set-cookie", /token=/);
    await refreshTokenAgent.get("/api/user").expect(200);
  });
});
