import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { addReference, createCategory, createTopic, listCategories, setTopicCategories, type Category } from "../db/repository";
import { normalizeText, stripHtml } from "../lib/text-processing";
import { getColors, iOS18Components, iOS18Typography } from "../theme/ios18";

type SourceMode = "name" | "text" | "url";
const SOURCE_MODES: SourceMode[] = ["name", "text", "url"];
const SOURCE_LABELS = ["Topic Name", "Paste Text", "Import URL"];

export default function CreateScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const colors = getColors(isDark);

  const [mode, setMode] = useState<SourceMode>("name");
  const [topicName, setTopicName] = useState("");
  const [topicText, setTopicText] = useState("");
  const [topicUrl, setTopicUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");

  useFocusEffect(
    useCallback(() => {
      listCategories(db).then(setCategories);
    }, [db]),
  );

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
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

  const isValid = () => {
    switch (mode) {
      case "name":
        return topicName.trim().length > 0;
      case "text":
        return topicName.trim().length > 0 && topicText.trim().length > 0;
      case "url":
        return topicName.trim().length > 0 && topicUrl.trim().length > 0;
    }
  };

  const fetchUrlContent = async (url: string): Promise<string | null> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "KnowledgeApp/1.0" },
      });
      clearTimeout(timeoutId);
      if (!response.ok) return null;
      const html = await response.text();
      return normalizeText(stripHtml(html));
    } catch {
      return null;
    }
  };

  const handleCreate = async () => {
    if (!isValid()) return;
    setLoading(true);

    try {
      let snapshot: string | null = null;

      if (mode === "url") {
        snapshot = await fetchUrlContent(topicUrl.trim());
        if (!snapshot) {
          Alert.alert(
            "Fetch Failed",
            "Could not fetch content from the URL. The topic will be created with the URL saved as a reference.",
          );
        }
      }

      const topicId = await createTopic(
        db,
        topicName.trim(),
        mode,
        mode === "text" ? topicText.trim() : null,
        mode === "url" ? topicUrl.trim() : null,
        snapshot,
      );

      if (mode === "url") {
        await addReference(db, topicId, topicUrl.trim());
      }

      if (selectedCategoryIds.length > 0) {
        await setTopicCategories(db, topicId, selectedCategoryIds);
      }

      setTopicName("");
      setTopicText("");
      setTopicUrl("");
      setSelectedCategoryIds([]);

      router.push(`/topic/${topicId}` as any);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create topic");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.systemGroupedBackground }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.sectionTitle, { color: colors.secondaryLabel }]}>Source Type</Text>
        <SegmentedControl
          values={SOURCE_LABELS}
          selectedIndex={SOURCE_MODES.indexOf(mode)}
          onChange={(e) => setMode(SOURCE_MODES[e.nativeEvent.selectedSegmentIndex])}
          style={styles.segmentedControl}
        />

        <Text style={[styles.sectionTitle, { color: colors.secondaryLabel }]}>Topic Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.tertiaryFill, color: colors.label }]}
          placeholder="e.g., React Native Navigation"
          placeholderTextColor={colors.tertiaryLabel}
          value={topicName}
          onChangeText={setTopicName}
          autoCapitalize="words"
        />

        {mode === "text" && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.secondaryLabel }]}>Content</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.tertiaryFill, color: colors.label }]}
              placeholder="Paste your study material here…"
              placeholderTextColor={colors.tertiaryLabel}
              value={topicText}
              onChangeText={setTopicText}
              multiline
              textAlignVertical="top"
            />
          </>
        )}

        {mode === "url" && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.secondaryLabel }]}>URL</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.tertiaryFill, color: colors.label }]}
              placeholder="https://example.com/article"
              placeholderTextColor={colors.tertiaryLabel}
              value={topicUrl}
              onChangeText={setTopicUrl}
              autoCapitalize="none"
              keyboardType="url"
              autoCorrect={false}
            />
          </>
        )}

        <Text style={[styles.sectionTitle, { color: colors.secondaryLabel }]}>Categories</Text>
        <View style={styles.chipContainer}>
          {categories.map((cat) => {
            const selected = selectedCategoryIds.includes(cat.id);
            return (
              <Pressable
                key={cat.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? colors.blue : colors.tertiaryFill,
                  },
                ]}
                onPress={() => toggleCategory(cat.id)}
              >
                <Text style={[styles.chipText, { color: selected ? "#fff" : colors.label }]}>{cat.name}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.addCategoryRow}>
          <TextInput
            style={[styles.input, styles.addCategoryInput, { backgroundColor: colors.tertiaryFill, color: colors.label }]}
            placeholder="New category…"
            placeholderTextColor={colors.tertiaryLabel}
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            onSubmitEditing={handleAddCategory}
            returnKeyType="done"
          />
          <Pressable
            style={[styles.addCategoryButton, { backgroundColor: colors.blue, opacity: newCategoryName.trim() ? 1 : 0.5 }]}
            onPress={handleAddCategory}
            disabled={!newCategoryName.trim()}
          >
            <Text style={styles.addCategoryButtonText}>Add</Text>
          </Pressable>
        </View>

        <Pressable
          style={[styles.createButton, !isValid() && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!isValid() || loading}
        >
          <Text style={styles.createButtonText}>{loading ? "Creating…" : "Create Topic"}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: iOS18Components.horizontalPadding },
  sectionTitle: {
    ...iOS18Typography.footnote,
    textTransform: "uppercase",
    marginBottom: 6,
    marginTop: 20,
    marginLeft: 4,
  },
  segmentedControl: { marginBottom: 4 },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: iOS18Components.textFieldRadius,
    ...iOS18Typography.body,
  },
  textArea: { minHeight: 160 },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16 },
  chipText: { ...iOS18Typography.subheadline, fontWeight: "500" },
  addCategoryRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  addCategoryInput: { flex: 1 },
  addCategoryButton: {
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: iOS18Components.buttonRadius,
  },
  addCategoryButtonText: { color: "#fff", ...iOS18Typography.subheadline, fontWeight: "600" },
  createButton: {
    marginTop: 24,
    padding: 16,
    borderRadius: iOS18Components.buttonRadius,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  createButtonDisabled: { opacity: 0.5 },
  createButtonText: { color: "#fff", ...iOS18Typography.headline },
});
