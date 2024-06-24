import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import bcrypt from "bcrypt";
import { users } from "../src/api/db/schema";

export const createMockDb = async () => {
  const postgresContainer = await new PostgreSqlContainer().start();
  process.env.DB_CONNECTION_STRING = postgresContainer.getConnectionUri();
  console.log(postgresContainer.getConnectionUri());
  const queryClient = postgres(postgresContainer.getConnectionUri());
  const db = drizzle(queryClient);
  await migrate(db, { migrationsFolder: "drizzle" });
  return db;
};

export const createTestUser = async (db: PostgresJsDatabase) => {
  const password = "test12345678";
  const username = "test";
  const encryptedPassword = await bcrypt.hash(password, 10);
  const u = await db.insert(users).values({ username, password: encryptedPassword, firstName: "test", lastName: "test" }).returning().execute();
  return { ...u[0], password };
};
