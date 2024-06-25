import { Router } from "express";
import { type LoginRequestDTO, UserSession } from "../types";
import { and, count, eq, sql } from "drizzle-orm";
import { users, followers } from "../db/schema.js";
import * as schema from "../db/schema.js";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import passport from "passport";
import jwt from "jsonwebtoken";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import bcrypt from "bcrypt";

const AuthController = (db: PostgresJsDatabase<typeof schema>) => {
  const router = Router();

  router.post("/login", async (req, res, next) => {
    try {
      const { username, password } = req.body as LoginRequestDTO;

      const usernameValid = z.string().min(1).safeParse(username);
      const passwordValid = z.string().min(1).safeParse(password);
      if (!usernameValid.success) {
        res.status(400).json({ error: "Login jest wymagany" });
        return;
      }
      if (!passwordValid.success) {
        res.status(400).json({ error: "Hasło jest wymagane" });
        return;
      }

      // // const u = await db.select().from(users).where(eq(users.email, email));
      const u = await db.query.users.findFirst({ where: and(eq(users.username, username)) });

      if (!u) {
        res.status(401).json({ error: "Niepoprawny login" });
        return;
      }

      const valid = await bcrypt.compare(password, u?.password || "");

      if (!valid) {
        res.status(401).json({ error: "Niepoprawne hasło" });
        return;
      }
      const sessionLength = parseInt(process.env.SESSION_LENGTH as string);

      const userData = { id: u.id, username: u.username, firstName: u.firstName, lastName: u.lastName };
      const token = jwt.sign(userData, process.env.SECRET as string, { expiresIn: sessionLength / 1000 });
      const refreshToken = jwt.sign(userData, process.env.SECRET as string, { expiresIn: "30d" });
      res.cookie("token", token, { maxAge: sessionLength });
      res.cookie("refreshToken", refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000 });
      // req.session.user = userData;
      // res.cookie("loggedIn", "true", { maxAge: SESSION_TIMEOUT });
      res.status(200).json({ message: "Zalogowano" });
    } catch (e) {
      next(e);
    }
  });

  router.get("/refresh-token", async (req, res, next) => {
    try {
      const token = req.cookies?.refreshToken;
      if (!token) {
        res.status(401).json({ error: "Brak tokenu" });
        return;
      }
      const decoded = jwt.verify(token, process.env.SECRET as string) as UserSession & jwt.JwtPayload;
      const userData = { id: decoded.id, username: decoded.username, firstName: decoded.firstName, lastName: decoded.lastName };
      const newToken = jwt.sign(userData, process.env.SECRET as string, { expiresIn: parseInt(process.env.SESSION_LENGTH as string) / 1000 });
      const refreshToken = jwt.sign(userData, process.env.SECRET as string, { expiresIn: "30d" });
      res.cookie("token", newToken, { maxAge: parseInt(process.env.SESSION_LENGTH as string) });
      res.cookie("refreshToken", refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000 });
      res.status(200).json({ message: "Token odświeżony" });
    } catch (e) {
      res.status(401).json({ error: "Błąd odświeżania tokenu" });
    }
  });

  router.get("/user", passport.authenticate("JWT", { session: false }), async (req, res, next) => {
    try {
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
    } catch (e) {
      next(e);
    }
  });

  router.get("/logout", passport.authenticate("JWT", { session: false }), (req, res, next) => {
    try {
      res.clearCookie("token");
      req.session.destroy(() => {
        res.status(200).json({ message: "Wylogowano" });
      });
    } catch (e) {
      next(e);
    }
  });

  router.post("/register", async (req, res, next) => {
    try {
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
      const encryptedPassword = await bcrypt.hash(password, 10);

      const user = await db.insert(users).values({ username, password: encryptedPassword, firstName, lastName }).returning();

      const userData = { id: user[0].id, username: user[0].username, firstName: user[0].firstName, lastName: user[0].lastName };

      const token = jwt.sign(userData, process.env.SECRET as string, { expiresIn: "1d" });
      const refreshToken = jwt.sign(userData, process.env.SECRET as string, { expiresIn: "30d" });
      res.cookie("token", token, { maxAge: parseInt(process.env.SESSION_LENGTH as string) });
      res.cookie("refreshToken", refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000 });

      res.status(201).json({ message: "Konto utworzone" });
    } catch (e) {
      next(e);
    }
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
