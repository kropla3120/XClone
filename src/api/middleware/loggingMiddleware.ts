import { NextFunction, Request, Response } from "express";

export default async function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log(`${req.method} ${req.url}`);

  next();
}
