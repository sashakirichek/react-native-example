import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Pressable, Switch, Text, useColorScheme, View, StyleSheet, Alert } from "react-native";

export default function Toggle({
  toggleKey,
  label,
  storage,
}: {
  toggleKey: string;
  label: string;
  storage?: typeof AsyncStorage;
}) {
  const storageInstance = storage || AsyncStorage;
  const [isEnabled, setEnabled] = useState(false);

  const colorScheme = useColorScheme();

  const storeData = async (key: string, value: boolean) => {
    try {
      const jsonValue = JSON.stringify(value);
      await storageInstance.setItem(key, jsonValue);
    } catch (e) {
      Alert.alert(`An error occurred storeData: ${e.message}`);
    }
  };

  const getData = async (key: string) => {
    try {
      const value = await storageInstance.getItem(key);
      if (value !== null) {
        setEnabled(JSON.parse(value));
      }
    } catch (e) {
      Alert.alert(`An error occurred getData: ${e.message}`);
    }
  };

  useEffect(() => {
    getData(toggleKey);
  }, [toggleKey]);

  const toggleSwitch = async () => {
    const newValue = !isEnabled;
    setEnabled(newValue);
    await storeData(toggleKey, newValue);
  };

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        paddingLeft: 40,
        paddingRight: 40,
        paddingTop: 10,
        paddingBottom: 10,
        justifyContent: "space-beetween",
        alignItems: "center",
        backgroundColor: colorScheme === "light" ? "#fff" : "#000",
        gap: 20,
      }}
    >
      <Text style={{ flex: 1, color: colorScheme === "light" ? "#000" : "#fff" }}>{label}</Text>
      <Switch
        trackColor={{ false: "#767577", true: "yellow" }}
        // thumbColor={isPushNotificationsEnabled ? '#f5dd4b' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isEnabled}
      />
    </View>
  );
}
const styles = StyleSheet.create({
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
