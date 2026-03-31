import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, useColorScheme, View } from "react-native";
import { createCategory, listCategories, type Category } from "../db/repository";
import { getColors, iOS18Components, iOS18Typography } from "../theme/ios18";

type QuizMode = "random" | "categories";
const MODE_LABELS = ["Random", "By Category"];

const COUNT_OPTIONS = [10, 20, 50];

export default function QuizTabScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const colors = getColors(isDark);

  const [mode, setMode] = useState<QuizMode>("random");
  const [questionCount, setQuestionCount] = useState(10);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");

  useFocusEffect(
    useCallback(() => {
      listCategories(db).then(setCategories);
    }, [db]),
  );

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      Alert.alert("Exists", "A category with that name already exists.");
      return;
    }
    try {
      const id = await createCategory(db, name);
      const updated = await listCategories(db);
      setCategories(updated);
      setSelectedCategoryIds((prev) => [...prev, id]);
      setNewCategoryName("");
    } catch {
      Alert.alert("Error", "Failed to create category.");
    }
  };

  const canStart = mode === "random" || selectedCategoryIds.length > 0;

  const handleStart = () => {
    if (mode === "random") {
      router.push(`/quiz/0?mode=random&count=${questionCount}` as any);
    } else {
      if (selectedCategoryIds.length === 0) {
        Alert.alert("Select Categories", "Pick at least one category to quiz on.");
        return;
      }
      router.push(`/quiz/0?mode=categories&categoryIds=${selectedCategoryIds.join(",")}` as any);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.systemGroupedBackground }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.sectionTitle, { color: colors.secondaryLabel }]}>Quiz Mode</Text>
      <SegmentedControl
        values={MODE_LABELS}
        selectedIndex={mode === "random" ? 0 : 1}
        onChange={(e) => setMode(e.nativeEvent.selectedSegmentIndex === 0 ? "random" : "categories")}
        style={styles.segmented}
      />

      {mode === "random" && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.secondaryLabel }]}>Number of Questions</Text>
          <View style={styles.countRow}>
            {COUNT_OPTIONS.map((n) => (
              <Pressable
                key={n}
                style={[
                  styles.countChip,
                  { backgroundColor: questionCount === n ? colors.blue : colors.tertiaryFill },
                ]}
                onPress={() => setQuestionCount(n)}
              >
                <Text style={[styles.countText, { color: questionCount === n ? "#fff" : colors.label }]}>{n}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {mode === "categories" && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.secondaryLabel }]}>Select Categories</Text>
          {categories.length === 0 ? (
            <Text style={[styles.emptyHint, { color: colors.tertiaryLabel }]}>
              No categories yet. Create one below or assign categories to topics first.
            </Text>
          ) : (
            <View style={styles.chipContainer}>
              {categories.map((cat) => {
                const selected = selectedCategoryIds.includes(cat.id);
                return (
                  <Pressable
                    key={cat.id}
                    style={[styles.chip, { backgroundColor: selected ? colors.blue : colors.tertiaryFill }]}
                    onPress={() => toggleCategory(cat.id)}
                  >
                    <Text style={[styles.chipText, { color: selected ? "#fff" : colors.label }]}>{cat.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
          <View style={styles.addRow}>
            <TextInput
              style={[styles.input, styles.addInput, { backgroundColor: colors.tertiaryFill, color: colors.label }]}
              placeholder="New category…"
              placeholderTextColor={colors.tertiaryLabel}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              onSubmitEditing={handleAddCategory}
              returnKeyType="done"
            />
            <Pressable
              style={[styles.addButton, { backgroundColor: colors.blue, opacity: newCategoryName.trim() ? 1 : 0.5 }]}
              onPress={handleAddCategory}
              disabled={!newCategoryName.trim()}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
          </View>
        </>
      )}

      <Pressable
        style={[styles.startButton, !canStart && { opacity: 0.5 }]}
        onPress={handleStart}
        disabled={!canStart}
      >
        <Ionicons name="play" size={20} color="#fff" />
        <Text style={styles.startButtonText}>Start Quiz</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: iOS18Components.horizontalPadding, paddingBottom: 40 },
  sectionTitle: {
    ...iOS18Typography.footnote,
    textTransform: "uppercase",
    marginBottom: 6,
    marginTop: 20,
    marginLeft: 4,
  },
  segmented: { marginBottom: 4 },
  countRow: { flexDirection: "row", gap: 10 },
  countChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: iOS18Components.buttonRadius,
  },
  countText: { ...iOS18Typography.headline },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16 },
  chipText: { ...iOS18Typography.subheadline, fontWeight: "500" },
  emptyHint: { ...iOS18Typography.subheadline, marginBottom: 8 },
  addRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: iOS18Components.textFieldRadius,
    ...iOS18Typography.body,
  },
  addInput: { flex: 1 },
  addButton: {
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: iOS18Components.buttonRadius,
  },
  addButtonText: { color: "#fff", ...iOS18Typography.subheadline, fontWeight: "600" },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 32,
    padding: 16,
    borderRadius: iOS18Components.buttonRadius,
    backgroundColor: "#007AFF",
  },
  startButtonText: { color: "#fff", ...iOS18Typography.headline },
});
