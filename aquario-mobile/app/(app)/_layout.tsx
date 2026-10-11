import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { theme } from "@/src/shared/theme/theme";

const TAB_BAR_CONTENT_HEIGHT = 58;

export default function AppLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: TAB_BAR_CONTENT_HEIGHT + insets.bottom,
          paddingTop: 7,
          paddingBottom: Math.max(insets.bottom, 8),
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="aquariums/index"
        options={{
          title: "Aquários",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="water-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="reminders/index"
        options={{
          title: "Agenda",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="reminders/history"
        options={{ href: null, title: "Histórico" }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="aquariums/create"
        options={{ href: null, title: "Novo aquário" }}
      />
      <Tabs.Screen
        name="aquariums/[id]/index"
        options={{ href: null, title: "Detalhes" }}
      />
      <Tabs.Screen
        name="aquariums/[id]/edit"
        options={{ href: null, title: "Editar aquário" }}
      />
      <Tabs.Screen
        name="aquariums/[id]/measurement"
        options={{ href: null, title: "Nova medição" }}
      />
      <Tabs.Screen
        name="aquariums/[id]/equipment"
        options={{ href: null, title: "Novo equipamento" }}
      />
      <Tabs.Screen
        name="aquariums/[id]/reminder"
        options={{ href: null, title: "Novo lembrete" }}
      />
      <Tabs.Screen
        name="aquariums/[id]/equipment-edit"
        options={{ href: null, title: "Editar equipamento" }}
      />
      <Tabs.Screen
        name="aquariums/[id]/measurement-edit"
        options={{ href: null, title: "Editar medição" }}
      />
      <Tabs.Screen
        name="aquariums/[id]/reminder-edit"
        options={{ href: null, title: "Editar lembrete" }}
      />
    </Tabs>
  );
}
