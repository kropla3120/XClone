import path, { dirname } from "path";
import fs from "fs";
import express from "express";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default function (req, res, next) {
  const p = path.join(__dirname, "public", req.url);
  const isFile = fs.existsSync(p) && fs.lstatSync(p).isFile();
  if (!req.url.startsWith("/api")) {
    if (!isFile) {
      req.url = "/";
    }
    express.static("public", { redirect: false })(req, res, next);
    return;
  }
  next();
}
