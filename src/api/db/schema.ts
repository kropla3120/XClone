import { relations } from "drizzle-orm";
import { text, integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey().notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey().notNull().unique(),
  content: text("content").notNull(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id),
  created: timestamp("created", { mode: "string", withTimezone: true }).notNull().defaultNow(),
  responseToPostId: integer("responseToPostId").references(() => posts.id, { onDelete: "cascade" }),
  likeCount: integer("likeCount").notNull().default(0),
  responseCount: integer("responseCount").notNull().default(0),
});

export const followers = pgTable("followers", {
  id: serial("id").primaryKey().notNull().unique(),
  followerId: integer("followerId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  followingId: integer("followingId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const likes = pgTable("likes", {
  id: serial("id").primaryKey().notNull().unique(),
  postId: integer("postId")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const postRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  responseToPost: one(posts, {
    fields: [posts.responseToPostId],
    references: [posts.id],
  }),
  likes: many(likes),
}));

export const followerRelations = relations(followers, ({ one }) => ({
  follower: one(users, {
    fields: [followers.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [followers.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

export const userRelations = relations(users, ({ one, many }) => ({
  posts: many(posts),
  followers: many(followers, {
    relationName: "following",
  }),
  following: many(followers, {
    relationName: "follower",
  }),
}));

export const likeRelations = relations(likes, ({ one }) => ({
  post: one(posts, {
    fields: [likes.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
}));
