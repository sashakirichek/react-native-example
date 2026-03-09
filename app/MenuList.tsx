import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, Text, TextInput, useColorScheme, View } from "react-native";
import { commonStyles } from "./commonStyles";
import { Customer } from "./db/database";

export default function MenuList() {
  const [customerName, setCustomerName] = useState<string>("");
  const [customers, setCustomers] = useState<string[]>([]);
  const db = useSQLiteContext();
  const isMounted = useRef(true);
  const colorScheme = useColorScheme();
  useEffect(() => {
    if (!isMounted.current) return;

    (async () => {
      await db.runAsync("CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL);");
      const allRows = await db.getAllAsync<Customer>("SELECT * FROM customers");
      setCustomers(allRows.map((customer) => customer.name));
      console.log(JSON.stringify(allRows));
    })();
  }, []);
  return (
    <>
      <TextInput
        style={commonStyles.emailInput}
        placeholder="Type your email"
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
      {customers.map((mi) => (
        <View
          key={mi}
          style={{
            // justifyContent: "center",
            alignItems: "center",
            paddingTop: 10,
          }}
        >
          <Text>{mi}</Text>
        </View>
      ))}
    </>
  );
}
