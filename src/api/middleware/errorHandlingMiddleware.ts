import { NextFunction, Request, Response } from "express";

export default async function errorHandlingMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  res.status(500).json({ message: "Wystąpił błąd serwera." });
  return;
}
