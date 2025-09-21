// contexts/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark';
const ThemeContext = createContext<{mode:ThemeMode; toggle:()=>void}>({} as any);

export const ThemeProvider: React.FC<{children:React.ReactNode}> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => { AsyncStorage.getItem('@theme').then(v => v && setMode(v as ThemeMode)); }, []);
  useEffect(() => { AsyncStorage.setItem('@theme', mode); }, [mode]);

  const toggle = () => setMode(m => (m === 'light' ? 'dark' : 'light'));
  return <ThemeContext.Provider value={{ mode, toggle }}>{children}</ThemeContext.Provider>;
};
export const useThemeMode = () => useContext(ThemeContext);
