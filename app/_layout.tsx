import { NavigationContainer, ThemeProvider, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import MenuScreen from "./MenuScreen";
import WelcomeScreen from "./WelcomeScreen";
import { useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Device from "expo-device";
import { JSX, useEffect, useState } from "react";
import SettScreen from "./SettScreen";
import { SQLiteProvider } from "expo-sqlite";
import MenuList from "./MenuList";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

type MenuItem = {
  name: string;
  icon: string;
  iconOutlined: string;
  component: JSX.Element;
};

export const menuItems: Record<string, MenuItem> = {
  welcome: { name: "Welcome", icon: "home", iconOutlined: "home-outline", component: WelcomeScreen },
  menu: { name: "Menu (API)", icon: "heart", iconOutlined: "heart-outline", component: MenuScreen },
  menuList: {
    name: "Menu (SQLite)",
    icon: "people-circle",
    iconOutlined: "people-circle-outline",
    component: MenuList,
  },
  settings: { name: "Settings", icon: "settings", iconOutlined: "settings-outline", component: SettScreen },
};

export default function RootLayout() {
  const [isTablet, setIsTablet] = useState<boolean>();
  const colorScheme = useColorScheme();
  function getDeviceType() {
    const deviceType = Device.getDeviceTypeAsync().then((deviceType) => {
      if (deviceType === Device.DeviceType.TABLET) {
        setIsTablet(true);
      } else {
        setIsTablet(false);
      }
    });
  }
  useEffect(() => getDeviceType(), []);

  const menuItemsKeys = Object.keys(menuItems);
  const stackNav = (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerTitleStyle: { color: colorScheme === "light" ? "#000" : "#fff", fontWeight: "bold" },
        headerStyle: { backgroundColor: colorScheme === "light" ? "#fff" : "#000" },
      }}
    >
      {menuItemsKeys.map((key: string) => {
        const menuItem = menuItems[key];
        return (
          <Stack.Screen
            name={menuItem.name}
            options={{ headerShown: true, animation: "ios_from_right" }}
            component={menuItem.component}
          />
        );
      })}
    </Stack.Navigator>
  );
  const drawerNav = (
    <Drawer.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        drawerPosition: "right",
        headerTitleStyle: { color: colorScheme === "light" ? "#000" : "#fff", fontWeight: "bold" },
        headerStyle: { backgroundColor: colorScheme === "light" ? "#fff" : "#000" },
      }}
    >
      {menuItemsKeys.map((key: string) => {
        const menuItem = menuItems[key];
        return <Drawer.Screen name={menuItem.name} options={{ headerShown: true }} component={menuItem.component} />;
      })}
    </Drawer.Navigator>
  );

  const tabNav = (
    <Tab.Navigator
      initialRouteName="Welcome"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let menuItem = Object.keys(menuItems)
            .map((key) => menuItems[key])
            .find((mi) => mi.name === route.name);

          return <Ionicons name={focused ? menuItem.icon : menuItem.iconOutlined} size={size} color={color} />;
        },
        tabBarActiveTintColor: "yellow",
        tabBarInactiveTintColor: "gray",

        headerTitleStyle: { color: colorScheme === "light" ? "#000" : "#fff", fontWeight: "bold" },
        headerStyle: { backgroundColor: colorScheme === "light" ? "#fff" : "#000" },
      })}
    >
      {menuItemsKeys.map((key: string) => {
        const menuItem = menuItems[key];
        return <Tab.Screen name={menuItem.name} options={{ headerShown: true }} component={menuItem.component} />;
      })}
    </Tab.Navigator>
  );

  return (
    <SQLiteProvider
      databaseName="userDatabase.db"
      onInit={async (db) => {
        await db.execAsync(
          `CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL);`,
        );
      }}
      options={{ useNewConnection: false }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          {isTablet ? drawerNav : tabNav}
        </ThemeProvider>
      </GestureHandlerRootView>
    </SQLiteProvider>
  );
}
