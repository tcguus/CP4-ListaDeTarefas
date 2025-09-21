// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';

// IMPORTANTÍSSIMO: inicializar i18n ANTES de renderizar qualquer tela
import '../i18n/i18n';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }} />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
