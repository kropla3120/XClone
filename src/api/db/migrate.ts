import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const migrationClient = postgres("postgres://postgres:12345678@localhost:5432/projekt", { max: 1 });
const db = drizzle(migrationClient);
await migrate(db, { migrationsFolder: "drizzle" });
migrationClient.end();
