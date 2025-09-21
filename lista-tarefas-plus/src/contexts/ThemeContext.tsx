import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
  adaptNavigationTheme,
} from "react-native-paper";

type Ctx = { mode: "light" | "dark"; toggle: () => void };
const ThemeCtx = createContext<Ctx>({} as any);

const light = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#4F46E5",
    secondary: "#22C55E",
  },
};

const dark = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#818CF8",
    secondary: "#22C55E",
  },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("@theme");
      if (saved === "dark" || saved === "light") setMode(saved);
    })();
  }, []);

  const toggle = async () => {
    const next = mode === "light" ? "dark" : "light";
    setMode(next);
    await AsyncStorage.setItem("@theme", next);
  };

  const theme = useMemo(() => (mode === "light" ? light : dark), [mode]);

  return (
    <ThemeCtx.Provider value={{ mode, toggle }}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeCtx.Provider>
  );
};

export const useThemeMode = () => useContext(ThemeCtx);
