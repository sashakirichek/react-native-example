import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";
import {
  deleteTopic,
  getMemo,
  getQuizQuestions,
  getReferences,
  getTopic,
  saveMemo,
  saveQuizQuestions,
  type Memo,
  type Reference,
  type Topic,
} from "../db/repository";
import { generateMemo } from "../lib/memo-generator";
import { generateQuizQuestions } from "../lib/quiz-generator";
import { getExcerpt } from "../lib/text-processing";
import { getColors, iOS18Components, iOS18Typography } from "../theme/ios18";

export default function TopicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const colors = getColors(isDark);

  const [topic, setTopic] = useState<Topic | null>(null);
  const [memo, setMemo] = useState<Memo | null>(null);
  const [references, setReferences] = useState<Reference[]>([]);
  const [quizCount, setQuizCount] = useState(0);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const topicId = Number(id);
    const t = await getTopic(db, topicId);
    setTopic(t);
    if (t) {
      setMemo(await getMemo(db, topicId));
      setReferences(await getReferences(db, topicId));
      const questions = await getQuizQuestions(db, topicId);
      setQuizCount(questions.length);
    }
  }, [db, id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!topic) {
    return (
      <View style={[styles.center, { backgroundColor: colors.systemGroupedBackground }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const sourceContent = topic.source_snapshot || topic.raw_text || "";

  const handleGenerateMemo = async () => {
    if (!sourceContent) {
      Alert.alert("No Content", "Add text or import a URL to generate a memo.");
      return;
    }
    setGenerating(true);
    try {
      const refUrls = references.map((r) => r.url);
      const result = generateMemo(topic.name, sourceContent, refUrls);
      await saveMemo(db, topic.id, result.content, result.sourceHash);
      await load();
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!sourceContent) {
      Alert.alert("No Content", "Add text or import a URL to generate a quiz.");
      return;
    }
    setGenerating(true);
    try {
      const questions = generateQuizQuestions(topic.name, sourceContent);
      if (questions.length === 0) {
        Alert.alert(
          "Not Enough Content",
          "The source material is too short to generate quiz questions. Add more content and try again.",
        );
        return;
      }
      await saveQuizQuestions(db, topic.id, questions);
      await load();
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Topic", `Delete "${topic.name}" and all associated data?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteTopic(db, topic.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.systemGroupedBackground }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.topicName, { color: colors.label }]}>{topic.name}</Text>
      <View style={styles.metaRow}>
        <View style={[styles.badge, { backgroundColor: colors.tertiaryFill }]}>
          <Text style={[styles.badgeText, { color: colors.secondaryLabel }]}>{topic.source_type}</Text>
        </View>
        <Text style={[styles.dateText, { color: colors.secondaryLabel }]}>
          Created {new Date(topic.created_at).toLocaleDateString()}
        </Text>
      </View>

      {/* Source preview */}
      {sourceContent ? (
        <View style={[styles.section, { backgroundColor: colors.secondaryGroupedBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.label }]}>Source Content</Text>
          <Text style={[styles.previewText, { color: colors.secondaryLabel }]}>{getExcerpt(sourceContent, 300)}</Text>
        </View>
      ) : (
        <View style={[styles.section, { backgroundColor: colors.secondaryGroupedBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.label }]}>Source Content</Text>
          <Text style={{ color: colors.secondaryLabel, ...iOS18Typography.subheadline }}>
            No content yet. This is a name-only topic — edit to add source material.
          </Text>
        </View>
      )}

      {/* References */}
      {references.length > 0 && (
        <View style={[styles.section, { backgroundColor: colors.secondaryGroupedBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.label }]}>References</Text>
          {references.map((ref) => (
            <View key={ref.id} style={styles.refRow}>
              <Ionicons name="link" size={14} color={colors.blue} />
              <Text style={[styles.refText, { color: colors.secondaryLabel }]} numberOfLines={1}>
                {ref.title || ref.url}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Generation actions */}
      <View style={styles.actions}>
        <Text style={[styles.sectionTitle, { color: colors.label }]}>Generate</Text>

        <Pressable
          style={[styles.actionButton, { backgroundColor: colors.green }]}
          onPress={handleGenerateMemo}
          disabled={generating}
        >
          <Ionicons name="document-text" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>{memo ? "Regenerate Memo" : "Generate Memo"}</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, { backgroundColor: colors.blue }]}
          onPress={handleGenerateQuiz}
          disabled={generating}
        >
          <Ionicons name="help-circle" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>{quizCount > 0 ? "Regenerate Quiz" : "Generate Quiz"}</Text>
        </Pressable>

        {generating && <ActivityIndicator style={{ marginTop: 8 }} />}
      </View>

      {/* View generated content — iOS 18 detail row style (Figma 550:50627) */}
      {memo && (
        <Pressable
          style={[styles.detailRow, { backgroundColor: colors.secondaryGroupedBackground }]}
          onPress={() => router.push(`/memo/${topic.id}` as any)}
        >
          <View style={styles.cardRow}>
            <Ionicons name="document-text" size={22} color={colors.green} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.cardTitle, { color: colors.label }]}>View Memo</Text>
              <Text style={[styles.cardSubtitle, { color: colors.secondaryLabel }]}>
                {memo.is_edited ? "Edited" : "Generated"}{" "}
                {new Date(memo.edited_at || memo.generated_at).toLocaleDateString()}
              </Text>
            </View>
            <Text style={[styles.drillIn, { color: colors.tertiaryLabel }]}>›</Text>
          </View>
        </Pressable>
      )}

      {quizCount > 0 && (
        <Pressable
          style={[styles.detailRow, { backgroundColor: colors.secondaryGroupedBackground }]}
          onPress={() => router.push(`/quiz/${topic.id}` as any)}
        >
          <View style={styles.cardRow}>
            <Ionicons name="help-circle" size={22} color={colors.blue} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.cardTitle, { color: colors.label }]}>Take Quiz</Text>
              <Text style={[styles.cardSubtitle, { color: colors.secondaryLabel }]}>{quizCount} questions</Text>
            </View>
            <Text style={[styles.drillIn, { color: colors.tertiaryLabel }]}>›</Text>
          </View>
        </Pressable>
      )}

      {/* Delete */}
      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <Ionicons name="trash" size={18} color={colors.red} />
        <Text style={[styles.deleteButtonText, { color: colors.red }]}>Delete Topic</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1 },
  content: { padding: iOS18Components.horizontalPadding, paddingTop: 100 },
  topicName: { ...iOS18Typography.largeTitle },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8, marginBottom: 16 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeText: { ...iOS18Typography.caption1, fontWeight: "500" },
  dateText: { ...iOS18Typography.caption1 },
  section: {
    borderRadius: iOS18Components.cardRadius,
    padding: iOS18Components.horizontalPadding,
    marginBottom: 12,
  },
  sectionTitle: { ...iOS18Typography.headline, marginBottom: 8 },
  previewText: { ...iOS18Typography.subheadline },
  refRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  refText: { ...iOS18Typography.footnote, flex: 1 },
  actions: { marginBottom: 16 },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: iOS18Components.buttonRadius,
    marginTop: 8,
  },
  actionButtonText: { color: "#fff", ...iOS18Typography.headline },
  /** iOS 18 detail row — matches Figma node 550:50627 */
  detailRow: {
    borderRadius: iOS18Components.cardRadius,
    paddingHorizontal: iOS18Components.horizontalPadding,
    paddingVertical: 12,
    marginBottom: 12,
  },
  cardRow: { flexDirection: "row", alignItems: "center" },
  cardTitle: { ...iOS18Typography.body },
  cardSubtitle: { ...iOS18Typography.footnote, marginTop: 2 },
  /** Drill-in chevron per Figma — SF Pro Semibold 17px, labels/tertiary */
  drillIn: { fontSize: 22, fontWeight: "600" },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    marginTop: 12,
    marginBottom: 40,
  },
  deleteButtonText: { ...iOS18Typography.body, fontWeight: "500" },
});
