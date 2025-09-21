// app/_layout.tsx
import React, { useEffect, useMemo } from 'react';
import { Slot } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from '../../src/contexts/ThemeContext'; // <- ESTE já envolve PaperProvider
import { AuthProvider } from '../../src/contexts/AuthContext';

function useConfigureNotifications() {
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    (async () => {
      try { await Notifications.requestPermissionsAsync(); } catch {}
    })();
  }, []);
}

export default function RootLayout() {
  useConfigureNotifications();

  const queryClient = useMemo(
    () => new QueryClient({
      defaultOptions: {
        queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: 1 },
      },
    }),
    []
  );

  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Slot />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
