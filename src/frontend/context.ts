import React from "react";

export const AppContext = React.createContext({ theme: "dark", setTheme: (theme: string) => {} });
