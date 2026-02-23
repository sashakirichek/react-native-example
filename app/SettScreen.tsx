import { useEffect, useState } from "react";
import { Text, useColorScheme, View, Pressable, StyleSheet, Switch, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

import Toggle from "./components/Toggle";

export default function SettScreen({ navigation }) {
  const colorScheme = useColorScheme();

  return (
    <View
      style={{
        flex: 1,
        // justifyContent: "center",
        alignItems: "center",
        backgroundColor: colorScheme === "light" ? "#fff" : "#000",
        paddingTop: 50,
      }}
    >
      <Text style={{ ...styles.header, color: colorScheme === "light" ? "#000" : "#fff" }}>Account Preferences</Text>

      <Toggle label="Push notification" toggleKey="pushNotification" storage={AsyncStorage} />
      <Toggle label="Marketing emails" toggleKey="marketingEmails" storage={AsyncStorage} />
      <Toggle label="Latest news" toggleKey="latestNews" storage={AsyncStorage} />
      <Pressable style={styles.pressable} onPress={() => navigation.navigate("Menu")}>
        <Text style={styles.pressableText}>Go to menu</Text>
      </Pressable>
      {/* <Pressable style={styles.pressable} onPress={() => navigation.goBack()}><Text style={styles.pressableText}>Go back</Text></Pressable> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "#ecf0f1",
    padding: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  text: {
    fontSize: 18,
  },
  header: {
    margin: 24,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  pressable: {
    backgroundColor: "#333",
    margin: 20,
    height: 50,
    width: 250,
    borderRadius: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pressableText: {
    color: "#fff",
  },
});
