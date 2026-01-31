import { Stack } from 'expo-router';
import ThemeProvider from '@/components/ThemeProvider';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="charts" options={{ title: 'Charts' }} />
        <Stack.Screen name="payoff-timeline" options={{ title: 'Payoff Timeline' }} />
        <Stack.Screen name="documentation" options={{ title: 'Help & Documentation' }} />
      </Stack>
    </ThemeProvider>
  );
}
