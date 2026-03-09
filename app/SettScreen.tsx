import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import Constants from "expo-constants";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import createCommonStyles from "./commonStyles";
import Toggle from "./components/Toggle";

export default function SettScreen({ navigation }) {
  const theme = useTheme();
  const commonStyles = createCommonStyles(theme);
  const styles = createStyles(theme);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        // justifyContent: "center",
        alignItems: "center",
        paddingTop: 50,
        backgroundColor: theme.colors.background,
      }}
    >
      <Toggle label="Push notification" toggleKey="pushNotification" storage={AsyncStorage} />
      <Toggle label="Marketing emails" toggleKey="marketingEmails" storage={AsyncStorage} />
      <Toggle label="Latest news" toggleKey="latestNews" storage={AsyncStorage} />
    </SafeAreaView>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: Constants.statusBarHeight,
      padding: 16,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 16,
    },
    text: {
      fontSize: 18,
      color: theme.colors.text,
    },
  });
