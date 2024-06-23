import { createContext } from "react";
import { UserSession } from "../api/types";

type UserContextType = {
  user: UserSession | null;
};

export const UserContext = createContext<UserContextType>({ user: null });
