import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import bcrypt from "bcrypt";
import { users } from "../src/api/db/schema";

export const createMockDb = async () => {
  const postgresContainer = await new PostgreSqlContainer().start();
  // console.log(postgresContainer.getConnectionUri());
  const queryClient = postgres(postgresContainer.getConnectionUri());
  const db = drizzle(queryClient);
  await migrate(db, { migrationsFolder: "drizzle" });
  console.log("DB Ready on " + postgresContainer.getConnectionUri());

  return { db, postgresContainer, queryClient };
};

export const createTestUser = async (db: PostgresJsDatabase, userData?) => {
  const password = "test12345678";
  const username = "test";
  const encryptedPassword = await bcrypt.hash(password, 10);
  const u = await db
    .insert(users)
    .values({ username, password: encryptedPassword, firstName: "test", lastName: "test", ...userData })
    .returning()
    .execute();
  return { ...u[0], password };
};
