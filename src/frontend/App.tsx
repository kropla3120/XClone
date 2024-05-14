import { RouterProvider } from "@tanstack/react-router";
import React, { useEffect } from "react";
import { router } from "./router";

const App = () => {
  // const [loggedIn, setLoggedIn] = React.useState(window.sessionStorage.getItem("loggedIn") === "true");
  // const [theme, setTheme] = React.useState("dark");

  useEffect(() => {
    const theme = window.sessionStorage.getItem("theme") || "dark";
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, []);

  return <RouterProvider router={router} />;
};

export default App;
