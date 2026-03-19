import { StyleSheet } from "react-native";

export const createCommonStyles = (theme) => {
  return StyleSheet.create({
    view: {
      // justifyContent: "center",
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 70,
    },
    description: {
      fontSize: 22,
      textAlign: "center",
      color: theme.colors.text,
    },
    pressable: {
      backgroundColor: theme.colors.border,
      paddingVertical: 20,
      paddingHorizontal: 30,
      borderRadius: 50,
      alignItems: "center",
      marginTop: 10,
      marginBottom: 10,
    },
    pressableDisabled: {
      backgroundColor: theme.colors.border,
      paddingVertical: 20,
      paddingHorizontal: 80,
      borderRadius: 50,
      padding: 20,
      alignItems: "center",
    },
    pressableText: {
      color: theme.colors.text,
    },
    text: {
      color: theme.colors.text,
      marginVertical: 5,
    },
    error: {
      color: "red",
      marginVertical: 5,
    },
    emailInput: {
      width: "100%",
      color: theme.colors.text,
      marginBottom: 20,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    header: {
      marginTop: 24,
      marginBottom: 12,
      fontSize: 18,
      fontWeight: "bold",
      textAlign: "left",
      color: theme.colors.text,
    },
    bigText: {
      fontSize: 24,
      fontWeight: "bold",
      color: "white",
    },
  });
};

export default createCommonStyles;
