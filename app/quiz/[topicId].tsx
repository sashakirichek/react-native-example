import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";
import { getQuizQuestions, saveQuizAttempt, type QuizOption, type QuizQuestion } from "../db/repository";
import { getColors, iOS18Components, iOS18Typography } from "../theme/ios18";

type QuestionWithOptions = QuizQuestion & { options: QuizOption[] };

export default function QuizScreen() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const colors = getColors(isDark);

  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!topicId) return;
      getQuizQuestions(db, Number(topicId)).then((qs) => {
        setQuestions(qs);
        setCurrentIndex(0);
        setSelectedOptionId(null);
        setRevealed(false);
        setScore(0);
        setFinished(false);
      });
    }, [db, topicId]),
  );

  if (questions.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.systemGroupedBackground }]}>
        <Text style={[styles.emptyText, { color: colors.secondaryLabel }]}>No quiz questions available.</Text>
      </View>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <View style={[styles.center, { backgroundColor: colors.systemGroupedBackground }]}>
        <Ionicons name={pct >= 70 ? "trophy" : "ribbon"} size={64} color={pct >= 70 ? colors.yellow : colors.gray} />
        <Text style={[styles.scoreTitle, { color: colors.label }]}>Quiz Complete!</Text>
        <Text style={[styles.scoreText, { color: colors.blue }]}>
          {score} / {questions.length} ({pct}%)
        </Text>
        <Pressable
          style={[styles.retryButton, { backgroundColor: colors.blue }]}
          onPress={() => {
            setCurrentIndex(0);
            setSelectedOptionId(null);
            setRevealed(false);
            setScore(0);
            setFinished(false);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backButtonText, { color: colors.secondaryLabel }]}>Back to Topic</Text>
        </Pressable>
      </View>
    );
  }

  const current = questions[currentIndex];

  const handleSelect = (optionId: number) => {
    if (revealed) return;
    setSelectedOptionId(optionId);
  };

  const handleReveal = () => {
    if (selectedOptionId == null) return;
    setRevealed(true);
    const selected = current.options.find((o) => o.id === selectedOptionId);
    if (selected?.is_correct) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = async () => {
    if (currentIndex === questions.length - 1) {
      const finalScore =
        score + (current.options.find((o) => o.id === selectedOptionId)?.is_correct && !revealed ? 1 : 0);
      await saveQuizAttempt(db, Number(topicId), score, questions.length);
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOptionId(null);
      setRevealed(false);
    }
  };

  const optionColor = (option: QuizOption) => {
    if (!revealed) {
      return selectedOptionId === option.id
        ? { backgroundColor: "rgba(0,122,255,0.12)", borderColor: colors.blue }
        : { backgroundColor: colors.secondaryGroupedBackground, borderColor: colors.separator };
    }
    if (option.is_correct) return { backgroundColor: "rgba(52,199,89,0.15)", borderColor: colors.green };
    if (selectedOptionId === option.id) return { backgroundColor: "rgba(255,59,48,0.12)", borderColor: colors.red };
    return { backgroundColor: colors.secondaryGroupedBackground, borderColor: colors.separator };
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.systemGroupedBackground }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.progress, { color: colors.secondaryLabel }]}>
        Question {currentIndex + 1} of {questions.length}
      </Text>
      <Text style={[styles.questionText, { color: colors.label }]}>{current.question_text}</Text>

      <View style={styles.options}>
        {current.options.map((option) => (
          <Pressable
            key={option.id}
            style={[styles.option, optionColor(option)]}
            onPress={() => handleSelect(option.id)}
            disabled={revealed}
          >
            <Text
              style={[
                styles.optionText,
                { color: colors.label },
                revealed && option.is_correct ? { fontWeight: "700" as const } : undefined,
              ]}
            >
              {option.option_text}
            </Text>
          </Pressable>
        ))}
      </View>

      {!revealed ? (
        <Pressable
          style={[styles.primaryButton, { backgroundColor: colors.blue }, selectedOptionId == null && { opacity: 0.5 }]}
          onPress={handleReveal}
          disabled={selectedOptionId == null}
        >
          <Text style={styles.primaryButtonText}>Check Answer</Text>
        </Pressable>
      ) : (
        <Pressable style={[styles.primaryButton, { backgroundColor: colors.blue }]} onPress={handleNext}>
          <Text style={styles.primaryButtonText}>{currentIndex === questions.length - 1 ? "Finish" : "Next"}</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  container: { flex: 1 },
  content: { padding: iOS18Components.horizontalPadding, paddingTop: 20 },
  progress: { ...iOS18Typography.footnote, marginBottom: 8 },
  questionText: { ...iOS18Typography.title3, marginBottom: 20 },
  options: { gap: 10, marginBottom: 20 },
  option: {
    padding: iOS18Components.horizontalPadding,
    borderRadius: iOS18Components.cardRadius,
    borderWidth: 2,
  },
  optionText: { ...iOS18Typography.body },
  primaryButton: {
    padding: 16,
    borderRadius: iOS18Components.buttonRadius,
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", ...iOS18Typography.headline },
  emptyText: { ...iOS18Typography.body },
  scoreTitle: { ...iOS18Typography.largeTitle, marginTop: 16 },
  scoreText: { ...iOS18Typography.title2, marginTop: 8 },
  retryButton: {
    marginTop: 24,
    padding: 14,
    paddingHorizontal: 40,
    borderRadius: iOS18Components.buttonRadius,
  },
  retryButtonText: { color: "#fff", ...iOS18Typography.headline },
  backButton: { marginTop: 12, padding: 12 },
  backButtonText: { ...iOS18Typography.subheadline },
});
