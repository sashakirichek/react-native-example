import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getMemo, getTopic, updateMemo, type Memo, type Topic } from "../db/repository";
import { getColors, iOS18Components, iOS18Typography } from "../theme/ios18";

export default function MemoScreen() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const colors = getColors(isDark);

  const [topic, setTopic] = useState<Topic | null>(null);
  const [memo, setMemo] = useState<Memo | null>(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (!topicId) return;
      const tid = Number(topicId);
      getTopic(db, tid).then(setTopic);
      getMemo(db, tid).then(setMemo);
    }, [db, topicId]),
  );

  if (!memo) {
    return (
      <View style={[styles.center, { backgroundColor: colors.systemGroupedBackground }]}>
        <Text style={[styles.emptyText, { color: colors.secondaryLabel }]}>
          No memo generated yet.
        </Text>
      </View>
    );
  }

  const handleEdit = () => {
    setEditContent(memo.content);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!editContent.trim()) return;
    await updateMemo(db, memo.id, editContent.trim());
    const updated = await getMemo(db, Number(topicId));
    setMemo(updated);
    setEditing(false);
    Alert.alert("Saved", "Memo updated successfully.");
  };

  const handleCancel = () => {
    setEditing(false);
    setEditContent("");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.systemGroupedBackground }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.label }]}>
          {topic?.name || "Memo"}
        </Text>
        {!editing && (
          <Pressable onPress={handleEdit} style={styles.editButton}>
            <Ionicons name="pencil" size={18} color={colors.blue} />
            <Text style={[styles.editButtonText, { color: colors.blue }]}>Edit</Text>
          </Pressable>
        )}
      </View>

      {memo.is_edited ? (
        <Text style={[styles.meta, { color: colors.secondaryLabel }]}>
          Edited {new Date(memo.edited_at!).toLocaleDateString()}
        </Text>
      ) : (
        <Text style={[styles.meta, { color: colors.secondaryLabel }]}>
          Generated {new Date(memo.generated_at).toLocaleDateString()}
        </Text>
      )}

      {editing ? (
        <>
          <TextInput
            style={[styles.editor, { backgroundColor: colors.tertiaryFill, color: colors.label }]}
            value={editContent}
            onChangeText={setEditContent}
            multiline
            textAlignVertical="top"
            autoFocus
          />
          <View style={styles.editActions}>
            <Pressable style={[styles.saveButton, { backgroundColor: colors.blue }]} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={handleCancel}>
              <Text style={[styles.cancelButtonText, { color: colors.secondaryLabel }]}>Cancel</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <View style={[styles.memoCard, { backgroundColor: colors.secondaryGroupedBackground }]}>
          {memo.content.split("\n").map((line, i) => {
            if (line.startsWith("# ")) {
              return (
                <Text key={i} style={[styles.h1, { color: colors.label }]}>
                  {line.slice(2)}
                </Text>
              );
            }
            if (line.startsWith("## ")) {
              return (
                <Text key={i} style={[styles.h2, { color: colors.blue }]}>
                  {line.slice(3)}
                </Text>
              );
            }
            if (line.startsWith("- **")) {
              const match = line.match(/^- \*\*(.+?)\*\*:?\s*(.*)/);
              if (match) {
                return (
                  <Text key={i} style={[styles.bulletText, { color: colors.secondaryLabel }]}>
                    {"  • "}
                    <Text style={{ fontWeight: "700", color: colors.label }}>
                      {match[1]}
                    </Text>
                    {match[2] ? `: ${match[2]}` : ""}
                  </Text>
                );
              }
            }
            if (line.startsWith("- ")) {
              return (
                <Text key={i} style={[styles.bulletText, { color: colors.secondaryLabel }]}>
                  {"  • "}
                  {line.slice(2)}
                </Text>
              );
            }
            if (line.startsWith("*") && line.endsWith("*")) {
              return (
                <Text key={i} style={[styles.italic, { color: colors.tertiaryLabel }]}>
                  {line.replace(/^\*+|\*+$/g, "")}
                </Text>
              );
            }
            if (line.trim() === "") {
              return <View key={i} style={{ height: 8 }} />;
            }
            return (
              <Text key={i} style={[styles.bodyText, { color: colors.secondaryLabel }]}>
                {line}
              </Text>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1 },
  content: { padding: iOS18Components.horizontalPadding, paddingBottom: 40 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { ...iOS18Typography.title2, flex: 1 },
  meta: { ...iOS18Typography.footnote, marginTop: 4, marginBottom: 16 },
  editButton: { flexDirection: "row", alignItems: "center", gap: 4, padding: 8 },
  editButtonText: { ...iOS18Typography.body },
  editor: {
    borderRadius: iOS18Components.cardRadius,
    padding: iOS18Components.horizontalPadding,
    ...iOS18Typography.subheadline,
    minHeight: 300,
  },
  editActions: { flexDirection: "row", gap: 12, marginTop: 12 },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: iOS18Components.buttonRadius,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", ...iOS18Typography.headline },
  cancelButton: { flex: 1, padding: 14, borderRadius: iOS18Components.buttonRadius, alignItems: "center" },
  cancelButtonText: { ...iOS18Typography.body },
  memoCard: {
    borderRadius: iOS18Components.cardRadius,
    padding: iOS18Components.horizontalPadding,
  },
  h1: { ...iOS18Typography.title2, marginBottom: 8, marginTop: 4 },
  h2: { ...iOS18Typography.headline, marginBottom: 6, marginTop: 12 },
  bulletText: { ...iOS18Typography.subheadline, marginBottom: 4 },
  bodyText: { ...iOS18Typography.subheadline, marginBottom: 4 },
  italic: { ...iOS18Typography.footnote, fontStyle: "italic", marginBottom: 4 },
  emptyText: { ...iOS18Typography.body },
});
