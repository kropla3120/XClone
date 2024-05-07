import { relations } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
});

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id),
  created: text("created").notNull(),
});

export const comments = sqliteTable("comments", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull().unique(),
  content: text("content").notNull(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id),
  postId: integer("postId")
    .notNull()
    .references(() => posts.id),
  created: text("created").notNull(),
});

export const postRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));
