import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Filters = ({ onChange, selections, sections }) => {
  return (
    <View style={styles.filtersContainer}>
      {sections.map((section, index) => (
        <TouchableOpacity
          key={section}
          onPress={() => {
            onChange(index);
          }}
          style={{
            flex: 1 / sections.length,
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
            backgroundColor: selections[index] ? "#e6e6e6" : "#333333",
            borderWidth: 1,
            borderColor: "#505050",
          }}
        >
          <View>
            <Text style={{ color: selections[index] ? "black" : "white" }}>{section}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  filtersContainer: {
    backgroundColor: "#525252",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
});

export default Filters;
