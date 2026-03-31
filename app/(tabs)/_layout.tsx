import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { getColors, iOS18Components } from "../theme/ios18";

export default function TabsLayout() {
  const isDark = useColorScheme() === "dark";
  const colors = getColors(isDark);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: iOS18Components.tabBarActiveTint(isDark),
        tabBarInactiveTintColor: iOS18Components.tabBarInactiveTint(isDark),
        headerStyle: {
          backgroundColor: colors.systemBackground,
        },
        headerTintColor: colors.label,
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.systemBackground,
          borderTopColor: colors.separator,
          borderTopWidth: iOS18Components.separatorHeight,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Library",
          tabBarIcon: ({ color, size }) => <Ionicons name="library" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "New Topic",
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
