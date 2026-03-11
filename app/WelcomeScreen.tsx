import { graphqlApiLink } from "@/apollo";
import { useTheme } from "@react-navigation/native";
import { Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { menuItems } from "./_layout";
import { createCommonStyles } from "./commonStyles";

export default function WelcomeScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const commonStyles = createCommonStyles(theme);
  return (
    <SafeAreaView style={commonStyles.view}>
      <Text style={commonStyles.header}>API fetching example with cache in database</Text>
      <Pressable style={commonStyles.pressable} onPress={() => navigation.navigate(menuItems.menu.name)}>
        <Text style={commonStyles.pressableText}>Go to menu</Text>
      </Pressable>
      <Text style={commonStyles.header}>DB only example</Text>
      <Pressable style={commonStyles.pressable} onPress={() => navigation.navigate(menuItems.customers.name)}>
        <Text style={commonStyles.pressableText}>Go to customers</Text>
      </Pressable>
      <Text style={commonStyles.header}>GraphQL example</Text>
      <Text style={commonStyles.text}>Uses {graphqlApiLink}</Text>
      <Pressable style={commonStyles.pressable} onPress={() => navigation.navigate(menuItems.graphql.name)}>
        <Text style={commonStyles.pressableText}>Go to graphql example</Text>
      </Pressable>
      <Text style={commonStyles.header}>Settings</Text>
      <Text style={commonStyles.text}>Uses deprecated AsyncStorage</Text>
      <Pressable style={commonStyles.pressable} onPress={() => navigation.navigate(menuItems.settings.name)}>
        <Text style={commonStyles.pressableText}>Go to settings</Text>
      </Pressable>
    </SafeAreaView>
  );
}
