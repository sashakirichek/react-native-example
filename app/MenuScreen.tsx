import { useNavigation, useTheme } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { Alert, SectionList, StyleSheet, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import createCommonStyles from "./commonStyles";
import Filters from "./components/Filters";
import { filterByQueryAndCategories, getMenuItems, MenuItem, saveMenuItems, sections } from "./db/database";
import { useSearchFilter } from "./hooks/useSearchFilter";
import { getSectionListData, useUpdateEffect } from "./utils";

const Item = ({ id, title, price, category, styles }: MenuItem) => (
  <View key={id} style={styles.item}>
    <Text style={styles.text}>{title}</Text>
    <Text style={styles.text}>${price}</Text>
  </View>
);

const API_URL =
  "https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/menu-items-by-category.json";

export default function MenuScreen() {
  const theme = useTheme();
  const commonStyles = createCommonStyles(theme);
  const styles = createStyles(theme);
  const navigation = useNavigation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState("");
  // module state
  const [data, setData] = useState<{ title: string; data: MenuItem[] }[]>([]);

  const [filterSelections, setFilterSelections] = useState(sections[0]);
  const { searchBarText, query, handleSearchChange } = useSearchFilter();
  const db = useSQLiteContext();
  const fetchData = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(API_URL);
      const json = await response.json();
      setMenuItems(json.menu);
      return json.menu;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
    return [];
  };

  useEffect(() => {
    (async () => {
      try {
        let menuItems = (await getMenuItems(db)) as MenuItem[];
        // The application only fetches the menu data once from a remote URL
        // and then stores it into a SQLite database.
        // After that, every application restart loads the menuj from the database
        if (!menuItems || menuItems.length === 0) {
          const fetchedMenuItems = await fetchData();
          console.info("API fetch is called");
          saveMenuItems(db, fetchedMenuItems);
          menuItems = fetchedMenuItems as MenuItem[];
        }

        const sectionListData = getSectionListData(menuItems);
        setData(sectionListData);
      } catch (e) {
        // Handle error
        Alert.alert(e instanceof Error ? e.message : String(e));
      }
    })();
  }, []);

  useUpdateEffect(() => {
    (async () => {
      const activeCategories =
        sections[0] === filterSelections
          ? sections.slice(1)
          : sections.filter((s, i) => {
              // If all filters are deselected, all categories are active
              return !s.localeCompare(filterSelections);
            });
      try {
        const menuItems = (await filterByQueryAndCategories(db, query, activeCategories)) as MenuItem[];
        const sectionListData = getSectionListData(menuItems);
        setData(sectionListData);
      } catch (e) {
        Alert.alert(e instanceof Error ? e.message : String(e));
      }
    })();
  }, [filterSelections, query]);

  useEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: "search",
        onChangeText: (event: any) => handleSearchChange(event.nativeEvent.text),
        hideWhenScrolling: false,
      },
    });
  }, [handleSearchChange, navigation]);

  const handleFiltersChange = async (index: number) => {
    setFilterSelections(sections[index]);
  };

  const colorScheme = useColorScheme();

  return (
    <SafeAreaView style={commonStyles.view}>
      <SectionList
        style={styles.sectionList}
        sections={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Item
            styles={{ ...commonStyles, ...styles }}
            key={item.id}
            id={item.id}
            title={item.title}
            price={item.price}
            category={item.category}
          />
        )}
        renderSectionHeader={({ section: { title } }) => <Text style={styles.header}>{title}</Text>}
      />
      <Filters onChange={handleFiltersChange} sections={sections} />
      {/* <Pressable style={commonStyles.pressable} onPress={() => clearMenuItems(db)}>
        <Text style={commonStyles.pressableText}>[TEST] Clear menu items from database</Text>
      </Pressable> */}
    </SafeAreaView>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 50, //StatusBar.currentHeight,
    },
    sectionList: {
      // paddingHorizontal: 16,
      flex: 1,
    },
    item: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      // padding: 16,
    },
    header: {
      fontSize: 20,
      paddingVertical: 10,
      color: theme.colors.text,
      fontWeight: "bold",
      // backgroundColor: "black",
    },
    title: {
      fontSize: 16,
      color: theme.colors.text,
      // color: "white",
    },
  });
