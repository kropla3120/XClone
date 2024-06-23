import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./db/schema.js";
import session from "express-session";
import cors from "cors";
import fs from "fs";
import AuthController from "./controllers/authController.js";
import PostsController from "./controllers/postsController.js";
import postgres from "postgres";
import { Strategy } from "passport-jwt";
import passport from "passport";
import cookieParser from "cookie-parser";
import { eq, Logger } from "drizzle-orm";
import "dotenv/config";
import loggingMiddleware from "./middleware/loggingMiddleware.js";
import errorHandlingMiddleware from "./middleware/errorHandlingMiddleware.js";
import FollowersController from "./controllers/followersController.js";

// const SESSION_TIMEOUT = 60000;

if (!process.env.SECRET) {
  console.error("SECRET not set");
  process.exit(1);
}

class MyLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    console.log({ query, params });
  }
}

const queryClient = postgres("postgres://postgres:12345678@localhost:5432/projekt");
const db = drizzle(queryClient, { schema, logger: new MyLogger() });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const jwtstrategy = new Strategy(
  {
    jwtFromRequest: (req) => req.cookies?.jwt,
    secretOrKey: process.env.SECRET,
  },
  (payload, done) => {
    if (!payload) return done(null, false);
    return done(null, payload);
  }
);

const app = express();

passport.use("JWT", jwtstrategy);
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user as any);
});

app.use(errorHandlingMiddleware);
app.use(cors());
app.use(express.json());
app.use(cookieParser(process.env.SECRET) as any);
app.use(
  session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(loggingMiddleware);

// const distPath = path.join(__dirname, "public");

// app.use("/", express.static(distPath));

if (process.env.NODE_ENV === "production") {
  app.use(function (req, res, next) {
    const p = path.join(__dirname, "public", req.url);
    console.log(p);
    const isFile = fs.existsSync(p) && fs.lstatSync(p).isFile();
    console.log(isFile);
    if (!req.url.startsWith("/api")) {
      if (!isFile) {
        req.url = "/";
      }
      express.static("public")(req, res, next);
      return;
    }
    next();
  });
}

app.use("/api", AuthController(db));
app.use("/api/posts", PostsController(db));
app.use("/api/followers", FollowersController(db));

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
