import { StyleSheet } from "react-native";

export const commonStyles = StyleSheet.create({
  description: {
    color: "#000",
    fontSize: 22,
    textAlign: "center",
  },
  pressable: {
    backgroundColor: "#3e524b",
    borderRadius: 7,
    width: "100%",
    padding: 10,
    alignItems: "center",
  },
  pressableDisabled: {
    backgroundColor: "gray",
    borderRadius: 7,
    width: "100%",
    padding: 10,
    alignItems: "center",
  },
  pressableText: {
    color: "#fff",
  },
  emailInput: {
    padding: 10,
    borderColor: "#3e524b",
    borderWidth: 2,
    borderRadius: 7,
    width: "100%",
  },
});
