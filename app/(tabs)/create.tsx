import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
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
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { createTopic, addReference } from "../db/repository";
import { stripHtml, normalizeText } from "../lib/text-processing";
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

      setTopicName("");
      setTopicText("");
      setTopicUrl("");

      router.push(`/topic/${topicId}` as any);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create topic");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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

        <Pressable
          style={[styles.createButton, !isValid() && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!isValid() || loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? "Creating…" : "Create Topic"}
          </Text>
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
