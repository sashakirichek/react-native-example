import React, { createContext, useContext } from "react";
import { useColorScheme } from "react-native";

const lightTheme = {
  colors: {
    primary: "#495E57",
    secondary: "#F4CE14",
    background: "#ffffff",
    text: "#000000",
    border: "#E0E0E0",
  },
};

const darkTheme = {
  colors: {
    primary: "#495E57",
    secondary: "#F4CE14",
    background: "#1a1a1a",
    text: "#ffffff",
    border: "#333333",
  },
};

export type Theme = typeof lightTheme;

const ThemeContext = createContext<Theme>(lightTheme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
