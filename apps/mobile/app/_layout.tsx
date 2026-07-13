import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/components/useColorScheme';
import { queryClient } from '@/constants/queryClient';
import { fetchSettings } from '@/lib/settingsApi';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function useProtectedRoute() {
  const router = useRouter();
  const segments = useSegments();
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);
  const restoreToken = useAuthStore((state) => state.restoreToken);
  const [hasRestored, setHasRestored] = useState(false);

  useEffect(() => {
    let mounted = true;

    restoreToken().finally(() => {
      if (mounted) setHasRestored(true);
    });

    return () => {
      mounted = false;
    };
  }, [restoreToken]);

  useEffect(() => {
    if (!hasRestored || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      router.replace('/login');
    } else if (token && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [token, segments, hasRestored, isLoading, router]);

  return !hasRestored || isLoading;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function SettingsLoader() {
  const setAvailableCurrencies = useSettingsStore((state) => state.setAvailableCurrencies);
  const setAvailableLanguages = useSettingsStore((state) => state.setAvailableLanguages);

  useEffect(() => {
    let cancelled = false;

    fetchSettings()
      .then((settings) => {
        if (cancelled) return;
        setAvailableCurrencies(settings.currencies as never);
        setAvailableLanguages(settings.languages as never);
      })
      .catch(() => {
        // Fail silently; defaults remain USD/en.
      });

    return () => {
      cancelled = true;
    };
  }, [setAvailableCurrencies, setAvailableLanguages]);

  return null;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const isRestoring = useProtectedRoute();

  if (isRestoring) {
    return null;
  }

  return (
    <>
      <SettingsLoader />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="category/[slug]" options={{ headerShown: false }} />
            <Stack.Screen name="activity/[slug]" options={{ headerShown: false }} />
            <Stack.Screen name="provider/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="messages" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </>
  );
}
