import { useEffect, useState } from "react";
import { ActivityIndicator, Text, useColorScheme, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

type MenuItem = {
      id: number
      title: "Spinach Artichoke Dip",
      price: number,
      category: {
        title: "Appetizers" | "Salads"| "Beverages"
      }
    }

export default function MenuScreen() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState('');

  const getMenuItems = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/menu-items-by-category.json')
      const json = await response.json()
      setMenuItems(json.menu);
    } catch (err) {
      setError(err?.message)
    } finally {
      setIsLoading(false)
    }
  }
  const colorScheme = useColorScheme();

  useEffect(() => {
    getMenuItems()
  },[])

  const textStyle = { color: colorScheme === 'light' ? '#000' : '#fff', };
  return (
    <View
      style={{
        flex: 1,
        // justifyContent: "center",
        alignItems: "center",
        paddingTop: 50
      }}
    >
      <Text style={textStyle}>Edit app/index.tsx to edit this screen.</Text>
      {isLoading ? ( 
       <ActivityIndicator />
      ) : (
      <FlatList 
      data={menuItems} 
      keyExtractor={i => i.id.toString()} 
      renderItem={i => <View style={{display: 'flex', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', margin: 10, gap: 20}}>
        <Text style={textStyle}>{i.item.title}</Text>
        <Text style={textStyle}>{i.item.price}</Text>
        </View>} 
        /> )}
    </View>
  );
}
