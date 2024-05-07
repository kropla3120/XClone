import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./db/schema";
import session from "express-session";
import { LoginRequestDTO } from "./types";
import { and, eq } from "drizzle-orm";
import cors from "cors";
import { posts, users } from "./db/schema";

// const SESSION_TIMEOUT = 60000;

const sqlite = new Database("db.sqlite");
const db = drizzle(sqlite, { schema });

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: "sekret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// const distPath = path.join(__dirname, "public");

// app.use("/", express.static(distPath));

// app.get("/", (req, res) => {
//   res.sendFile(path.join(distPath, "index.html"));
// });

app.get("/api/users", async (req, res) => {
  const u = await db.select().from(users);
  res.json(u);
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body as LoginRequestDTO;
  // const u = await db.select().from(users).where(eq(users.email, email));
  const u = await db.query.users.findFirst({ where: and(eq(users.username, username), eq(users.password, password)) });
  if (!u) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  req.session.user = { id: u.id, username: u.username, firstName: u.firstName, lastName: u.lastName };
  // res.cookie("loggedIn", "true", { maxAge: SESSION_TIMEOUT });
  res.status(200).json({ message: "Logged in" });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.status(200).json({ message: "Logged out" });
  });
});

app.post("/api/register", async (req, res) => {
  const { username, password, firstName, lastName } = req.body;
  const u = await db.query.users.findFirst({ where: eq(users.username, username) });
  if (u) {
    res.status(400).json({ error: "Username already in use" });
    return;
  }

  await db.insert(users).values({ username, password, firstName, lastName }).execute();

  res.status(201).json({ message: "User created" });
});

app.get("/api/posts", async (req, res) => {
  if (!req.session.user) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }
  const data = await db.query.posts.findMany({
    with: {
      user: true,
    },
  });
  res.json(data);
});

app.get("/api/posts/:id", async (req, res) => {
  if (!req.session.user) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }
  const { id } = req.params;
  const data = await db.query.posts.findFirst({
    where: eq(posts.id, parseInt(id)),
    with: {
      user: true,
    },
  });
  res.json(data);
});

app.post("/api/posts", (req, res) => {
  if (!req.session.user) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }
  const { title, content } = req.body;
  const { id } = req.session.user;
  db.insert(posts).values({ title, content, userId: id, created: new Date().toISOString() }).execute();
  res.status(201).json({ message: "Post created" });
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
