import { Router } from "express";
import { and, arrayContains, asc, desc, eq, inArray, sql, or } from "drizzle-orm";
import * as schema from "../db/schema";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import passport from "passport";
import { followers } from "../db/schema";
import { makePgArray } from "drizzle-orm/pg-core";

const { users } = schema;

const FollowersController = (db: PostgresJsDatabase<typeof schema>) => {
  const router = Router();

  router.use(passport.authenticate("JWT", { session: false }));

  router.put("/follow/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const { user } = req as any;
      const u = await db.query.users.findFirst({ where: eq(users.id, parseInt(id)) });
      if (!u) {
        res.status(404).json({ error: "Użytkownik nie istnieje" });
        return;
      }
      const follow = await db.query.followers.findFirst({
        where: and(eq(followers.followerId, user.id), eq(followers.followingId, parseInt(id))),
      });
      if (follow) {
        res.status(400).json({ error: "Już obserwujesz tego użytkownika" });
        return;
      }
      await db
        .insert(followers)
        .values({ followerId: user.id, followingId: parseInt(id) })
        .execute();
      res.status(200).json({ message: "Obserwujesz użytkownika" });
    } catch (e) {
      next(e);
    }
  });

  router.delete("/unfollow/:id", async (req, res, next) => {
    try {
      const { id } = req.params;
      const { user } = req as any;
      const u = await db.query.users.findFirst({ where: eq(users.id, parseInt(id)) });
      if (!u) {
        res.status(404).json({ error: "Użytkownik nie istnieje" });
        return;
      }
      const followEntry = await db.query.followers.findFirst({
        where: and(eq(followers.followerId, user.id), eq(followers.followingId, parseInt(id))),
      });
      if (!followEntry) {
        res.status(400).json({ error: "Nie obserwujesz tego użytkownika" });
        return;
      }
      await db
        .delete(followers)
        .where(and(eq(followers.followerId, user.id), eq(followers.followingId, parseInt(id))))
        .execute();
      res.status(200).json({ message: "Przestałeś obserwować użytkownika" });
    } catch (e) {
      next(e);
    }
  });

  return router;
};

export default FollowersController;
