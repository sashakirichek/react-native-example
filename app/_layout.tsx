import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Device from "expo-device";
import { SQLiteProvider } from "expo-sqlite";
import { JSX, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MenuList from "./CustomersList";
import MenuScreen from "./MenuScreen";
import SettScreen from "./SettScreen";

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
  menu: { name: "Menu (API + DB)", icon: "heart", iconOutlined: "heart-outline", component: MenuScreen },
  welcome: { name: "Welcome", icon: "home", iconOutlined: "home-outline", component: WelcomeScreen },
  menuList: {
    name: "Customers (SQLite)",
    icon: "people-circle",
    iconOutlined: "people-circle-outline",
    component: MenuList,
  },
  settings: { name: "Settings", icon: "settings", iconOutlined: "settings-outline", component: SettScreen },
};

if (!__DEV__) {
  console.log = () => null;
  console.warn = () => null;
  console.error = () => null;
  console.info = () => null;
  console.debug = () => null;
}

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
      initialRouteName={menuItems.menu.name}
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
      initialRouteName={menuItems.menu.name}
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
      initialRouteName={menuItems.menu.name}
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
          `CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL);
          create table if not exists menuitems (id integer primary key not null, uuid text, title text, price text, category text);`,
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
