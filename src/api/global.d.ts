import { UserSession } from "./types";
import { Session, SessionData } from "express-session";

// declare global {
//   namespace Express {
//     interface CustomSessionFields {
//       user?: UserSession;
//     }

//     export interface Request {
//       session: Session & Partial<SessionData> & CustomSessionFields;
//     }
//   }
// }

declare module "express-session" {
  interface SessionData {
    user: UserSession;
  }
}
