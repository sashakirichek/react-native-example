import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { getColors } from "./theme/ios18";

if (!__DEV__) {
  console.log = () => null;
  console.warn = () => null;
  console.error = () => null;
  console.info = () => null;
  console.debug = () => null;
}

async function initDatabase(db: import("expo-sqlite").SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      source_type TEXT NOT NULL DEFAULT 'name',
      raw_text TEXT,
      raw_url TEXT,
      source_snapshot TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS refs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      title TEXT,
      added_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS memos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      source_hash TEXT,
      generated_at TEXT NOT NULL DEFAULT (datetime('now')),
      edited_at TEXT,
      is_edited INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS quiz_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
      question_text TEXT NOT NULL,
      question_type TEXT NOT NULL DEFAULT 'mcq',
      source_hash TEXT,
      generated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS quiz_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
      option_text TEXT NOT NULL,
      is_correct INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      completed_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    PRAGMA foreign_keys = ON;
  `);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = getColors(isDark);

  return (
    <SQLiteProvider
      databaseName="knowledge.db"
      onInit={initDatabase}
      options={{ useNewConnection: false }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              headerTintColor: colors.blue,
              headerStyle: { backgroundColor: colors.systemBackground },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="topic/[id]"
              options={{
                headerShown: true,
                headerTitle: "Topic",
                headerBackTitle: "Library",
                headerBlurEffect: "regular",
                headerTransparent: true,
                headerLargeTitle: false,
              }}
            />
            <Stack.Screen
              name="quiz/[topicId]"
              options={{
                headerShown: true,
                headerTitle: "Quiz",
                headerBackTitle: "Topic",
              }}
            />
            <Stack.Screen
              name="memo/[topicId]"
              options={{
                headerShown: true,
                headerTitle: "Memo",
                headerBackTitle: "Topic",
              }}
            />
          </Stack>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SQLiteProvider>
  );
}
