import { Button } from "@react-navigation/elements";
import { Text, useColorScheme, View, Pressable, StyleSheet } from "react-native";

export default function WelcomeScreen({navigation}) {
    const colorScheme = useColorScheme();
  return (
    <View
      style={{
        flex: 1,
        // justifyContent: "center",
        alignItems: "center",
        backgroundColor: colorScheme === 'light' ? '#fff' : '#000',        
        paddingTop: 50
      }}
    >
      <Text style={{color: colorScheme === 'light' ? '#000' : '#fff', }}>Edit app/WelcomeScreen.tsx to edit this screen.</Text>
      <Pressable style={styles.pressable} onPress={() => navigation.navigate('Menu')}><Text style={styles.pressableText}>Go to menu</Text></Pressable>
      {/* <Pressable style={styles.pressable} onPress={() => navigation.goBack()}><Text style={styles.pressableText}>Go back</Text></Pressable> */}
    </View>
  );
}


const styles = StyleSheet.create({
  pressable: {
    backgroundColor: '#333',
    margin: 20,
    height: 50,
    width:250,
    borderRadius: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',    
  },
  pressableText: {
    color: '#fff',
    
  }
});
