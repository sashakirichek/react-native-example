import { Text, useColorScheme, View } from "react-native";

export default function MenuScreen() {
  const colorScheme = useColorScheme();
  return (
    <View
      style={{
        flex: 1,
        // justifyContent: "center",
        alignItems: "center",
        paddingTop: 50
      }}
    >
      <Text style={{color: colorScheme === 'light' ? '#000' : '#fff', }}>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
