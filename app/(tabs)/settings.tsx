import { ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";
import { getColors, iOS18Components, iOS18Typography } from "../theme/ios18";

export default function SettingsScreen() {
  const isDark = useColorScheme() === "dark";
  const colors = getColors(isDark);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.systemGroupedBackground }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: colors.label }]}>Knowledge App</Text>
      <Text style={[styles.version, { color: colors.secondaryLabel }]}>Version 1.0.0</Text>

      <View style={[styles.section, { backgroundColor: colors.secondaryGroupedBackground }]}>
        <Text style={[styles.sectionTitle, { color: colors.label }]}>About</Text>
        <Text style={[styles.sectionText, { color: colors.secondaryLabel }]}>
          Store knowledge topics, generate structured memos using the Double Diamond process (Discover → Define →
          Develop → Deliver), and test yourself with auto-generated quizzes — all offline on your device.
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.secondaryGroupedBackground }]}>
        <Text style={[styles.sectionTitle, { color: colors.label }]}>Generation on iOS 18+</Text>
        <Text style={[styles.sectionText, { color: colors.secondaryLabel }]}>
          Memos and quizzes are generated using a deterministic heuristic engine that runs entirely in JavaScript — no
          AI model required. It extracts key terms by word frequency, splits text into sentences, and builds cloze,
          true/false, and multiple-choice questions through pattern matching and term substitution. Memos follow the
          Double Diamond structure automatically.
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.secondaryGroupedBackground }]}>
        <Text style={[styles.sectionTitle, { color: colors.label }]}>Generation on iOS 26+</Text>
        <Text style={[styles.sectionText, { color: colors.secondaryLabel }]}>
          On devices running iOS/iPadOS 26 or later with Apple Intelligence enabled, the app can optionally use Apple's
          on-device Foundation Models for richer memos and smarter quiz questions. This runs on the Neural Engine with
          no cloud dependency. If Apple Intelligence is not available, the app falls back to the deterministic engine
          seamlessly.
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.secondaryGroupedBackground }]}>
        <Text style={[styles.sectionTitle, { color: colors.label }]}>Data</Text>
        <Text style={[styles.sectionText, { color: colors.secondaryLabel }]}>
          All data is stored locally on this device using SQLite. Nothing is sent to any server. Swipe left on any topic
          in the library to delete it.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: iOS18Components.horizontalPadding, paddingBottom: 40 },
  title: { ...iOS18Typography.largeTitle, marginTop: 16 },
  version: { ...iOS18Typography.footnote, marginTop: 4, marginBottom: 24 },
  section: {
    borderRadius: iOS18Components.cardRadius,
    padding: iOS18Components.horizontalPadding,
    marginBottom: 12,
  },
  sectionTitle: { ...iOS18Typography.headline, marginBottom: 8 },
  sectionText: { ...iOS18Typography.subheadline },
});
