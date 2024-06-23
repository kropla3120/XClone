import { UserSession } from "./types";
import { Session, SessionData } from "express-session";

declare global {
  namespace Express {
    interface User extends UserSession {}
  }
}

// declare module "express-session" {
//   // interface SessionData {
//   //   user: UserSession;
//   // }
//   interface User extends UserSession {}
//   interface Re
// }
