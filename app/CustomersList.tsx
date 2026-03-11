import { useNavigation, useTheme } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import createCommonStyles from "./commonStyles";
import { Customer } from "./db/database";
import { useSearchFilter } from "./hooks/useSearchFilter";

export default function MenuList() {
  const navigation = useNavigation();
  const [customerName, setCustomerName] = useState<string>("");
  const [customers, setCustomers] = useState<string[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<string[]>([]);
  const db = useSQLiteContext();
  const isMounted = useRef(true);
  const { query, handleSearchChange } = useSearchFilter();
  const theme = useTheme();
  const commonStyles = createCommonStyles(theme);
  useEffect(() => {
    if (!isMounted.current) return;

    (async () => {
      await db.runAsync("CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL);");
      const allRows = await db.getAllAsync<Customer>("SELECT * FROM customers");
      const customerNames = allRows.map((customer) => customer.name);
      setCustomers(customerNames);
      setFilteredCustomers(customerNames);
    })();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: "Search customers",
        onChangeText: (event: any) => handleSearchChange(event.nativeEvent.text),
        hideWhenScrolling: false,
      },
    });
  }, [handleSearchChange, navigation]);

  useEffect(() => {
    const filtered = customers.filter((customer) => customer.toLowerCase().includes(query.toLowerCase()));
    setFilteredCustomers(filtered);
  }, [customers, query]);

  return (
    <SafeAreaView style={commonStyles.view}>
      <ScrollView
        // contentInset={{ top: 80, bottom: 20 }} // Extra scroll padding
        contentInsetAdjustmentBehavior="automatic" // Adjust for safe area automatically
        style={{
          // justifyContent: "center",
          flex: 1,
        }}
      >
        <TextInput
          style={commonStyles.emailInput}
          placeholder="Add new customer"
          onChangeText={setCustomerName}
          keyboardType="email-address"
          value={customerName}
        />
        <Pressable
          style={commonStyles.pressable}
          disabled={!customerName}
          onPress={() => {
            setCustomers([...customers, customerName]);
            db.runAsync("INSERT INTO customers (name) VALUES (?)", customerName);
            setCustomerName("");
          }}
        >
          <Text style={commonStyles.pressableText}>Add customer</Text>
        </Pressable>
        {filteredCustomers.map((mi) => (
          <Text key={mi} style={commonStyles.text}>
            {mi}
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
