import { RouterProvider } from "@tanstack/react-router";
import React, { useEffect } from "react";
import { router } from "./router";
import { AppContext } from "./context";

const App = () => {
  // const [loggedIn, setLoggedIn] = React.useState(window.sessionStorage.getItem("loggedIn") === "true");
  const [theme, setTheme] = React.useState("dark");

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return (
    <AppContext.Provider value={{ theme, setTheme }}>
      <RouterProvider router={router} />
    </AppContext.Provider>
  );
};

export default App;
