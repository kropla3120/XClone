import type { GlobalSetupContext } from "vitest/node";
import { createMockDb, createTestUser } from "../utils";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

let db;
let app;

export default async function setup({ provide }: GlobalSetupContext) {
  db = await createMockDb();
  app = (await import("../../src/api/index")).default;
}
export { db, app };

declare module "vitest" {
  export interface ProvidedContext {
    db: PostgresJsDatabase;
    app: any;
  }
}
