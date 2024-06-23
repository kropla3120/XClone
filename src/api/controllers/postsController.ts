import { Router } from "express";
import { and, arrayContains, asc, desc, eq, inArray, sql, or, isNull, isNotNull } from "drizzle-orm";
import * as schema from "../db/schema";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import passport from "passport";
import { followers } from "../db/schema";
import { makePgArray } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

const { users, posts, likes } = schema;

const PostsController = (db: PostgresJsDatabase<typeof schema>) => {
  const router = Router();

  router.use(passport.authenticate("JWT", { session: false }));

  router.get("/", async (req, res) => {
    const { offset, orderDirection, onlyFollowing } = req.query;

    const order = orderDirection === "asc" ? asc(posts.id) : desc(posts.id);
    const offsetParsed = offset ? parseInt(offset as string) : 0;
    const followed = db.select({ data: followers.followingId }).from(followers).where(eq(followers.followerId, req.user!.id));
    const likedByUser = db
      .select({ postId: likes.postId })
      .from(likes)
      .where(and(eq(likes.userId, req.user!.id), eq(likes.postId, posts.id)))
      .limit(1);

    const base = db
      .select({
        user: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
        },
        id: posts.id,
        content: posts.content,
        created: posts.created,
        // userId: posts.userId,
        myPost: eq(posts.userId, req.user!.id),
        creatorFollowed: inArray(posts.userId, followed),
        likeCount: posts.likeCount,
        responseCount: posts.responseCount,
        responseToPostId: posts.responseToPostId,
        likedByMe: isNotNull(likedByUser),
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(isNull(posts.responseToPostId))
      .orderBy(order)
      .offset(offsetParsed)
      .limit(10)
      .$dynamic();

    // console.log(onlyFollowing);
    if (onlyFollowing === "true") {
      // console.log("aa");
      const data = await base.where(or(inArray(posts.userId, followed), eq(posts.userId, req.user!.id))).execute(); //posty obserwowanych + własne
      res.json(data);
      return;
    }

    const data = await base.execute();

    res.json(data);
  });

  router.get("/:id", async (req, res) => {
    const { id } = req.params;

    const likedByUser = db
      .select({ postId: likes.postId })
      .from(likes)
      .where(and(eq(likes.userId, req.user!.id), eq(likes.postId, posts.id)))
      .limit(1);

    const data = await db.query.posts.findFirst({
      where: eq(posts.id, parseInt(id)),
      with: {
        user: {
          columns: {
            password: false,
          },
        },
        responseToPost: true,
        // a: true,
      },
      extras: {
        likedByMe: isNotNull(likedByUser).as("likedByMe"),
      },
    });
    res.json(data);
  });

  router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const { id: userId } = req.user!;

    const hasAccess = await userHasAccessToPost(db, userId, parseInt(id));

    if (!hasAccess) {
      res.status(403).json({ message: "Nie masz dostępu do tego postu" });
      return;
    }

    const validated = postValidation.safeParse(req.body);

    if (!validated.success) {
      res.status(400).json({ error: validated.error.issues.map((i) => i.message).join("\n") });
      return;
    }

    db.update(posts)
      .set({ content })
      .where(eq(posts.id, parseInt(id)))
      .execute();
    res.json({ message: "Post zaktualizowany" });
  });

  router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const { id: userId } = req.user!;

    const hasAccess = await userHasAccessToPost(db, userId, parseInt(id));

    if (!hasAccess) {
      res.status(403).json({ message: "Nie masz dostępu do tego postu" });
      return;
    }

    db.delete(posts)
      .where(eq(posts.id, parseInt(id)))
      .execute();
    res.json({ message: "Post usunięty" });
  });

  router.get("/:id/responses", async (req, res) => {
    const { id } = req.params;
    const data = await db.query.posts.findMany({
      where: eq(posts.responseToPostId, parseInt(id)),
      with: {
        user: {
          columns: {
            password: false,
          },
        },
      },
    });
    res.json(data);
  });

  router.get("/:id/likes", async (req, res) => {
    const { id } = req.params;
    const data = await db.query.likes.findMany({
      where: eq(posts.id, parseInt(id)),
      with: {
        user: {
          columns: {
            password: false,
          },
        },
      },
    });
    res.json(data);
  });

  router.put("/:id/like", async (req, res) => {
    const { id } = req.params;
    const { id: userId } = req.user!;

    const liked = await db.query.likes.findFirst({
      where: and(eq(likes.postId, parseInt(id)), eq(likes.userId, userId)),
    });

    if (liked) {
      res.status(400).json({ error: "Post już polubiony" });
      return;
    }

    await db.transaction(async (ctx) => {
      await ctx
        .insert(likes)
        .values({ postId: parseInt(id), userId })
        .execute();

      await ctx
        .update(posts)
        .set({ likeCount: sql`${posts.likeCount} + 1` })
        .where(eq(posts.id, parseInt(id)))
        .execute();
    });
    res.json({ message: "Polubiono post" });
  });

  router.delete("/:id/like", async (req, res) => {
    const { id } = req.params;
    const { id: userId } = req.user!;

    const liked = await db.query.likes.findFirst({
      where: and(eq(likes.postId, parseInt(id)), eq(likes.userId, userId)),
    });

    if (!liked) {
      res.status(400).json({ error: "Post nie jest polubiony" });
      return;
    }

    await db.transaction(async (ctx) => {
      await ctx
        .delete(likes)
        .where(and(eq(likes.postId, parseInt(id)), eq(likes.userId, userId)))
        .execute();

      await ctx
        .update(posts)
        .set({ likeCount: sql`${posts.likeCount} - 1` })
        .where(eq(posts.id, parseInt(id)))
        .execute();
    });
    res.json({ message: "Usunięto polubienie" });
  });

  router.post("/", async (req, res) => {
    const { content, responseToPostId } = req.body;
    const { id } = req.user!;

    const post: typeof posts.$inferInsert = { content, userId: id, created: new Date().toISOString(), responseToPostId: responseToPostId };

    const validated = postValidation.safeParse(post);

    if (!validated.success) {
      res.status(400).json({ error: validated.error.issues.map((i) => i.message).join("\n") });
      return;
    }

    try {
      await db.transaction(async (ctx) => {
        ctx.insert(posts).values(post).execute();
        if (responseToPostId) {
          await ctx
            .update(posts)
            .set({ responseCount: sql`${posts.responseCount} + 1` })
            .where(eq(posts.id, responseToPostId))
            .execute();
        }
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Wystąpił błąd podczas dodawania postu" });
      return;
    }
    res.status(201).json({ message: "Post utworzony" });
  });

  return router;
};

const userHasAccessToPost = async (db: PostgresJsDatabase<typeof schema>, userId: number, postId: number) => {
  const post = await db.query.posts.findFirst({
    where: and(eq(posts.id, postId), eq(posts.userId, userId)),
  });
  return !!post;
};

const postValidation = createInsertSchema(posts, {
  content: z.string().min(1, "Treść jest wymagana"),
});

export default PostsController;
