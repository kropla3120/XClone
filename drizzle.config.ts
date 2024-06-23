import type { Config } from "drizzle-kit";
export default {
  schema: "./src/api/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: "postgres://postgres:12345678@localhost:5432/projekt",
  },
  dialect: "postgresql",
} satisfies Config;
