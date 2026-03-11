import { ApolloProvider } from "@apollo/client/react";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Device from "expo-device";
import { SQLiteProvider } from "expo-sqlite";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { client } from "./../apollo";
import MenuList from "./CustomersList";
import GraphQlExample from "./GraphQlExample";
import MenuScreen from "./MenuScreen";
import SettScreen from "./SettScreen";
import WelcomeScreen from "./WelcomeScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

type MenuItem = {
  name: string;
  title: string;
  icon: string;
  iconOutlined: string;
  component: React.ComponentType<any>;
  searchable: boolean;
};

export const menuItems: Record<string, MenuItem> = {
  welcome: {
    name: "Welcome",
    title: "Welcome",
    icon: "home",
    iconOutlined: "home-outline",
    component: WelcomeScreen,
    searchable: false,
  },
  menu: {
    name: "Menu",
    title: "Menu (API + DB)",
    searchable: true,
    icon: "heart",
    iconOutlined: "heart-outline",
    component: MenuScreen,
  },
  customers: {
    name: "Customers",
    title: "Customers (SQLite)",
    icon: "people-circle",
    iconOutlined: "people-circle-outline",
    component: MenuList,
    searchable: true,
  },
  graphql: {
    name: "GraphQL",
    title: "GraphQL",
    icon: "fish",
    iconOutlined: "fish-outline",
    component: GraphQlExample,
    searchable: false,
  },
  settings: {
    name: "Settings",
    title: "Settings (legacy AsyncStorage)",
    icon: "settings",
    iconOutlined: "settings-outline",
    component: SettScreen,
    searchable: false,
  },
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
  const initialPage = menuItems.welcome.name;
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
      initialRouteName={initialPage}
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
            options={{
              headerShown: true,
              animation: "ios_from_right",
              headerTitle: menuItem.title,
              headerBlurEffect: "regular",
              headerTransparent: true,
              headerLargeTitle: true,
            }}
            component={menuItem.component}
          />
        );
      })}
    </Stack.Navigator>
  );
  const drawerNav = (
    <Drawer.Navigator
      initialRouteName={initialPage}
      screenOptions={{
        drawerPosition: "right",
        // headerTitleStyle: { color: colorScheme === "light" ? "#000" : "#fff", fontWeight: "bold" },
        // headerStyle: { backgroundColor: colorScheme === "light" ? "#fff" : "#000" },
      }}
    >
      {menuItemsKeys.map((key: string) => {
        const menuItem = menuItems[key];
        return (
          <Drawer.Screen
            name={menuItem.name}
            options={{
              headerShown: true,
              headerTitle: menuItem.title,
              headerTransparent: true,
            }}
            component={menuItem.component}
          />
        );
      })}
    </Drawer.Navigator>
  );

  const tabNav = (
    <Tab.Navigator
      initialRouteName={initialPage}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let menuItem = Object.keys(menuItems)
            .map((key) => menuItems[key])
            .find((mi) => mi.name === route.name);

          if (!menuItem) return null;
          return (
            <Ionicons
              name={focused ? (menuItem.icon as any) : (menuItem.iconOutlined as any)}
              size={size}
              color={color}
            />
          );
        },

        headerTitleStyle: { color: colorScheme === "light" ? "#000" : "#fff", fontWeight: "bold" },
        headerStyle: { backgroundColor: colorScheme === "light" ? "#fff" : "#000" },
      })}
    >
      {menuItemsKeys.map((key: string) => {
        const menuItem = menuItems[key];
        return (
          <Tab.Screen
            name={menuItem.name}
            options={{
              headerShown: true,
              headerTitle: menuItem.title,
              headerTransparent: true,
            }}
            component={menuItem.component}
          />
        );
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
          <ApolloProvider client={client}>{isTablet ? drawerNav : tabNav}</ApolloProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SQLiteProvider>
  );
}
