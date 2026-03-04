import { PickPartial } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import debounce from "lodash.debounce";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, SectionList, StatusBar, StyleSheet, Text, useColorScheme, View } from "react-native";
import { Searchbar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import commonStyles from "./commonStyles";
import Filters from "./components/Filters";
import {
  clearMenuItems,
  filterByQueryAndCategories,
  getMenuItems,
  MenuItem,
  saveMenuItems,
  sections,
} from "./db/database";
import { getSectionListData, useUpdateEffect } from "./utils";

const Item = ({ id, title, price }: PickPartial<MenuItem, "id" | "title" | "price">) => (
  <View key={id} style={styles.item}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.title}>${price}</Text>
  </View>
);

const API_URL =
  "https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/menu-items-by-category.json";

export default function MenuScreen() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState("");
  // module state
  const [data, setData] = useState([]);
  const [searchBarText, setSearchBarText] = useState("");
  const [query, setQuery] = useState("");
  const [filterSelections, setFilterSelections] = useState(sections.map(() => false));
  const db = useSQLiteContext();
  const fetchData = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(API_URL);
      const json = await response.json();
      setMenuItems(json.menu);
      return json.menu;
    } catch (err) {
      setError(err?.message);
    } finally {
      setIsLoading(false);
    }
    return [];
  };

  useEffect(() => {
    (async () => {
      try {
        let menuItems = await getMenuItems(db);
        // The application only fetches the menu data once from a remote URL
        // and then stores it into a SQLite database.
        // After that, every application restart loads the menuj from the database
        if (menuItems?.length === 0) {
          const menuItems = await fetchData();
          console.info("API fetch is called");
          saveMenuItems(db, menuItems);
        }

        const sectionListData = getSectionListData(menuItems);
        setData(sectionListData);
      } catch (e) {
        // Handle error
        Alert.alert(e.message);
      }
    })();
  }, []);

  useUpdateEffect(() => {
    (async () => {
      const activeCategories = sections.filter((s, i) => {
        // If all filters are deselected, all categories are active
        if (filterSelections.every((item) => item === false)) {
          return true;
        }
        return filterSelections[i];
      });
      try {
        const menuItems = await filterByQueryAndCategories(db, query, activeCategories);
        const sectionListData = getSectionListData(menuItems);
        setData(sectionListData);
      } catch (e) {
        Alert.alert(e.message);
      }
    })();
  }, [filterSelections, query, data]);

  const lookup = useCallback((q) => {
    setQuery(q);
  }, []);

  const debouncedLookup = useMemo(() => debounce(lookup, 500), [lookup]);

  const handleSearchChange = (text) => {
    setSearchBarText(text);
    debouncedLookup(text);
  };

  const handleFiltersChange = async (index) => {
    const arrayCopy = [...filterSelections];
    arrayCopy[index] = !filterSelections[index];
    setFilterSelections(arrayCopy);
  };

  const fetchMenuItems = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(API_URL);
      const json = await response.json();
      setMenuItems(json.menu);
      return json.menu;
    } catch (err) {
      setError(err?.message);
    } finally {
      setIsLoading(false);
    }
  };
  const colorScheme = useColorScheme();

  const textStyle = { color: colorScheme === "light" ? "#000" : "#fff" };
  return (
    <SafeAreaView style={styles.container}>
      <Searchbar
        placeholder="Search"
        placeholderTextColor="white"
        onChangeText={handleSearchChange}
        value={searchBarText}
        style={styles.searchBar}
        iconColor="white"
        inputStyle={{ color: "white" }}
        elevation={0}
      />
      <Filters selections={filterSelections} onChange={handleFiltersChange} sections={sections} />
      <SectionList
        style={styles.sectionList}
        sections={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Item key={item.id} id={item.id} title={item.title} price={item.price} />}
        renderSectionHeader={({ section: { title } }) => <Text style={styles.header}>{title}</Text>}
      />
      <Pressable style={commonStyles.pressable} onPress={() => clearMenuItems(db)}>
        <Text style={commonStyles.pressableText}>[TEST] Clear menu items from database</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: StatusBar.currentHeight,
  },
  sectionList: {
    // paddingHorizontal: 16,
  },
  searchBar: {
    marginBottom: 20,
    backgroundColor: "#333333",
    borderRadius: 0,
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
    color: "yellow",
    backgroundColor: "black",
  },
  title: {
    fontSize: 16,
    color: "white",
  },
});
