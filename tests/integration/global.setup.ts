import { test as setup } from "@playwright/test";
import { createMockDb, createTestUser } from "../utils";
import { exec } from "child_process";

setup("setup database", async ({}) => {
  const db = await createMockDb();
  await createTestUser(db);
});
