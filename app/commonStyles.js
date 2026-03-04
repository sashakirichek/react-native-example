import { StyleSheet } from "react-native";

const commonStyles = StyleSheet.create({
  description: {
    color: "#000",
    fontSize: 22,
    textAlign: "center",
  },
  pressable: {
    backgroundColor: "#333",
    width: "100%",
    padding: 20,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  pressableDisabled: {
    backgroundColor: "gray",
    width: "100%",
    padding: 20,
    alignItems: "center",
  },
  pressableText: {
    color: "#fff",
  },
  emailInput: {
    width: "100%",
    color: "#fff",
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderWidth: 1,
    borderColor: "#505050",
  },
});

export default commonStyles;
