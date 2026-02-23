import { NavigationContainer, ThemeProvider, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import MenuScreen from "./MenuScreen";
import WelcomeScreen from "./WelcomeScreen";
import { useColorScheme } from "react-native";
import {Ionicons} from "@expo/vector-icons"
import * as Device from 'expo-device';
import { JSX, useEffect, useState } from "react";
import SettScreen from "./SettScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

type MenuItem = {
  name: string
  icon: string
  iconOutlined: string
  component: JSX.Element
}

const menuItems: Record<string,MenuItem> = {
  welcome: {name: "Welcome", icon: 'home', iconOutlined: 'home-outlined', component: WelcomeScreen},
  menu: {name: "Menu", icon: 'heart', iconOutlined: 'heart-outlined', component: MenuScreen},
  settings: {name: "Settings", icon: 'settings', iconOutlined: 'settings-outlined', component: SettScreen},
}


export default function RootLayout() {
  const [isTablet, setIsTablet] = useState<boolean>();
  const colorScheme = useColorScheme();
   function getDeviceType() {
  const deviceType =  Device.getDeviceTypeAsync().then(deviceType => {
  if (deviceType === Device.DeviceType.TABLET) {
  setIsTablet(true)
} else {
  setIsTablet(false)
}    
})} 
  useEffect(() => getDeviceType(), []) 

  const menuItemsKeys = Object.keys(menuItems);
  const stackNav = <Stack.Navigator initialRouteName="Welcome"
  screenOptions={{ 
    headerTitleStyle: {color: colorScheme === 'light' ? '#000' : '#fff', fontWeight: 'bold'},
    headerStyle: {backgroundColor : colorScheme === 'light' ? '#fff' : '#000'}}}>
        {menuItemsKeys.map((key: string) => {
          const menuItem = menuItems[key]
          return <Stack.Screen name={menuItem.name} options={
          {headerShown: true, animation: 'ios_from_right'}
        } component={menuItem.component} />
        })}       
      </Stack.Navigator>  
      const drawerNav = <Drawer.Navigator initialRouteName="Welcome"
  screenOptions={{ drawerPosition: 'right',
    headerTitleStyle: {color: colorScheme === 'light' ? '#000' : '#fff', fontWeight: 'bold'},
    headerStyle: {backgroundColor : colorScheme === 'light' ? '#fff' : '#000'}}}>
        {menuItemsKeys.map((key: string) => {
          const menuItem = menuItems[key]
          return <Drawer.Screen name={menuItem.name} options={
          {headerShown: true, }
        } component={menuItem.component} />
        })}
      </Drawer.Navigator>

        const tabNav = <Tab.Navigator  initialRouteName="Welcome"
  screenOptions={({route}) => ({ 
    tabBarIcon: ({focused, color, size}) => {
      let iconName; 
      if (route.name === "Welcome") {
        iconName = focused ? 'home': 'home-outline'
      } else {
        iconName = focused ? 'heart': 'heart-outline'
      } 
      if (route.name === "Settings") {
        iconName = focused ? 'settings': 'settings-outline'
      }
return <Ionicons name={iconName} size={size} color={color}/>
    },
    tabBarActiveTintColor: 'yellow',
    tabBarInactiveTintColor: 'gray',

    headerTitleStyle: {color: colorScheme === 'light' ? '#000' : '#fff', fontWeight: 'bold'},
    headerStyle: {backgroundColor : colorScheme === 'light' ? '#fff' : '#000'}})}>
        {menuItemsKeys.map((key: string) => {
          const menuItem = menuItems[key]
          return <Tab.Screen name={menuItem.name} options={
          {headerShown: true, }
        } component={menuItem.component} />
        })}        
      </Tab.Navigator>

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {isTablet ? drawerNav : tabNav}
      </ThemeProvider>
    </GestureHandlerRootView>
  )
    
}
