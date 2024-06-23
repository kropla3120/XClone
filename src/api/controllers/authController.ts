import { Router } from "express";
import { LoginRequestDTO } from "../types";
import { and, count, eq, sql } from "drizzle-orm";
import { users, followers } from "../db/schema";
import * as schema from "../db/schema";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import passport from "passport";
import jwt from "jsonwebtoken";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

const AuthController = (db: PostgresJsDatabase<typeof schema>) => {
  const router = Router();

  router.post("/login", async (req, res) => {
    // console.log(req);
    const { username, password } = req.body as LoginRequestDTO;
    // // const u = await db.select().from(users).where(eq(users.email, email));
    const u = await db.query.users.findFirst({ where: and(eq(users.username, username), eq(users.password, password)) });
    if (!u) {
      res.status(401).json({ error: "Nieprawidłowe dane" });
      return;
    }

    // console.log(u);
    const userData = { id: u.id, username: u.username, firstName: u.firstName, lastName: u.lastName };
    const token = jwt.sign(userData, process.env.SECRET, { expiresIn: "1d" });
    res.cookie("jwt", token, { maxAge: parseInt(process.env.SESSION_LENGTH as string) });
    // req.session.user = userData;
    // res.cookie("loggedIn", "true", { maxAge: SESSION_TIMEOUT });
    res.status(200).json({ message: "Zalogowano" });
  });

  router.get("/user", passport.authenticate("JWT", { session: false }), async (req, res) => {
    const userId = req.user!.id;
    const u = await db.query.users.findFirst({
      where: eq(users.id, userId),

      with: {
        followers: {
          with: {
            follower: {
              columns: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          columns: {
            id: false,
            followerId: false,
            followingId: false,
          },
        },

        following: {
          with: {
            following: {
              columns: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          columns: {
            id: false,
            followerId: false,
            followingId: false,
          },
        },
      },
      columns: { password: false },
    });

    const userFlat = { ...u, followers: u?.followers.map((f) => f.follower), following: u?.following.map((f) => f.following) };

    res.json(userFlat);
  });

  router.get("/logout", passport.authenticate("JWT", { session: false }), (req, res) => {
    res.clearCookie("jwt");
    req.session.destroy(() => {
      res.status(200).json({ message: "Wylogowano" });
    });
  });

  router.post("/register", async (req, res) => {
    const { username, password, firstName, lastName } = req.body;

    const validated = userValidation.safeParse(req.body);

    if (!validated.success) {
      console.log(validated.error);
      res.status(400).json({ error: validated.error.issues.map((i) => i.message).join("\n") });
      return;
    }
    const u = await db.query.users.findFirst({ where: eq(users.username, username) });
    if (u) {
      res.status(400).json({ error: "Nazwa użytkownika jest już zajęta" });
      return;
    }

    const user = await db.insert(users).values({ username, password, firstName, lastName }).returning();

    const userData = { id: user[0].id, username: user[0].username, firstName: user[0].firstName, lastName: user[0].lastName };

    const token = jwt.sign(userData, process.env.SECRET, { expiresIn: "1d" });
    res.cookie("jwt", token, { maxAge: parseInt(process.env.SESSION_LENGTH as string) });

    res.status(201).json({ message: "Konto utworzone" });
  });

  return router;
};

const userValidation = createInsertSchema(users, {
  password: z.string().min(8, "Hasło za krótkie").max(100, "Hasło za długie"),
  username: z.string().min(4, "Nazwa użytkownika za krótka").max(20, "Nazwa użytkownika za długa"),
  firstName: z.string().min(1, "Imię jest wymagane"),
  lastName: z.string().min(1, "Nazwisko jest wymagane"),
});

export default AuthController;
