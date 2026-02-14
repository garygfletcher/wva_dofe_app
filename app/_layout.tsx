import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import {
  EBGaramond_400Regular,
  EBGaramond_600SemiBold,
} from '@expo-google-fonts/eb-garamond';
import {
  PlayfairDisplay_700Bold,
  PlayfairDisplay_700Bold_Italic,
  PlayfairDisplay_900Black,
} from '@expo-google-fonts/playfair-display';
import { SpecialElite_400Regular } from '@expo-google-fonts/special-elite';
import { UnifrakturMaguntia_400Regular } from '@expo-google-fonts/unifrakturmaguntia';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

void SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { authLoading } = useAuth();
  const [fontsLoaded] = useFonts({
    EBGaramond_400Regular,
    EBGaramond_600SemiBold,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_700Bold_Italic,
    PlayfairDisplay_900Black,
    UnifrakturMaguntia_400Regular,
    SpecialElite_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded && !authLoading) {
      void SplashScreen.hideAsync();
    }
  }, [authLoading, fontsLoaded]);

  if (!fontsLoaded || authLoading) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
