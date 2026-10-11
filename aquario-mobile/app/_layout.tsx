import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LogBox } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ReminderNotificationSync } from "@/src/features/reminders/components/reminder-notification-sync";
import { AuthProvider, useAuth } from "@/src/providers/auth-provider";
import { QueryProvider } from "@/src/providers/query-provider";
import { theme } from "@/src/shared/theme/theme";

LogBox.ignoreLogs([
  "expo-notifications: Android Push notifications (remote notifications)",
]);

function Navigation() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerTintColor: theme.colors.text,
        headerStyle: { backgroundColor: theme.colors.surface },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.colors.background },
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <AuthProvider>
          <ReminderNotificationSync />
          <Navigation />
          <StatusBar style="dark" />
        </AuthProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
