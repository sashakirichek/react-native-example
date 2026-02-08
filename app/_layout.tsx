import { NavigationContainer, ThemeProvider, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MenuScreen from "./MenuScreen";
import WelcomeScreen from "./WelcomeScreen";
import { useColorScheme } from "react-native";
import {Ionicons} from "@expo/vector-icons"

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
export default function RootLayout() {
  const colorScheme = useColorScheme();
  return <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
    {/* <Stack.Navigator initialRouteName="Welcome"
  screenOptions={{ 
    headerTitleStyle: {color: colorScheme === 'light' ? '#000' : '#fff', fontWeight: 'bold'},
    headerStyle: {backgroundColor : colorScheme === 'light' ? '#fff' : '#000'}}}>
        <Stack.Screen name="Welcome" options={
          {headerShown: true, animation: 'ios_from_right'}
        } component={WelcomeScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} options={
          {headerShown: true, animation: 'ios_from_right'}
        } />
        
      </Stack.Navigator>  */}
      <Tab.Navigator  initialRouteName="Welcome"
  screenOptions={({route}) => ({ 
    tabBarIcon: ({focused, color, size}) => {
      let iconName; 
      if (route.name === "Welcome") {
        iconName = focused ? 'home': 'home-outline'
      } else {
        iconName = focused ? 'heart': 'heart-outline'
      }
return <Ionicons name={iconName} size={size} color={color}/>
    },
    tabBarActiveTintColor: 'yellow',
    tabBarInactiveTintColor: 'gray',

    headerTitleStyle: {color: colorScheme === 'light' ? '#000' : '#fff', fontWeight: 'bold'},
    headerStyle: {backgroundColor : colorScheme === 'light' ? '#fff' : '#000'}})}>
        <Tab.Screen name="Welcome" options={
          {headerShown: true, }
        } component={WelcomeScreen} />
        <Tab.Screen name="Menu" component={MenuScreen} options={
          {headerShown: true, }
        } />
        
      </Tab.Navigator></ThemeProvider>
    
}
