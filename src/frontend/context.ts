import { createContext } from "react";
import { UserDTO, UserSession } from "../api/types";

type UserContextType = {
  user: UserDTO | null;
};

export const UserContext = createContext<UserContextType>({ user: null });
