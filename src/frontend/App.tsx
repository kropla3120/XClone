import { RouterProvider } from "@tanstack/react-router";
import React, { useEffect } from "react";
import { router } from "./router";
import { UserContext } from "./context";
import { UserSession } from "src/api/types";
import { useQuery } from "@tanstack/react-query";

const App = () => {
  // const [loggedIn, setLoggedIn] = React.useState(window.localStorage.getItem("loggedIn") === "true");
  // const [theme, setTheme] = React.useState("dark");
  // const [user, setUser] = React.useState<UserSession | null>(null);

  useEffect(() => {
    const theme = window.localStorage.getItem("theme") || "dark";
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, []);

  return <RouterProvider router={router} />;
};

export default App;
