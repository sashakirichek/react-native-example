import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { deleteTopic, listTopics, searchTopics, type TopicWithMeta } from "../db/repository";
import { getColors, iOS18Components, iOS18Typography } from "../theme/ios18";

export default function LibraryScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const colors = getColors(isDark);

  const [topics, setTopics] = useState<TopicWithMeta[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const swipeableRefs = useRef<Map<number, Swipeable | null>>(new Map());

  const loadTopics = useCallback(async () => {
    const results = searchQuery.trim() ? await searchTopics(db, searchQuery.trim()) : await listTopics(db);
    setTopics(results);
  }, [db, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      loadTopics();
    }, [loadTopics]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTopics();
    setRefreshing(false);
  };

  const sourceIcon = (type: string) => {
    switch (type) {
      case "url":
        return "link";
      case "text":
        return "document-text";
      default:
        return "bookmark";
    }
  };

  const handleDelete = (item: TopicWithMeta) => {
    Alert.alert("Delete Topic", `Delete "${item.name}" and all associated data?`, [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => swipeableRefs.current.get(item.id)?.close(),
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteTopic(db, item.id);
          await loadTopics();
        },
      },
    ]);
  };

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-iOS18Components.swipeActionWidth, 0],
      outputRange: [1, 0.5],
      extrapolate: "clamp",
    });
    return (
      <Animated.View style={[styles.deleteAction, { transform: [{ scale }] }]}>
        <Ionicons name="trash" size={22} color="#fff" />
        <Text style={styles.deleteActionText}>Delete</Text>
      </Animated.View>
    );
  };

  const renderItem = ({ item }: { item: TopicWithMeta }) => (
    <Swipeable
      ref={(ref) => {
        swipeableRefs.current.set(item.id, ref);
      }}
      renderRightActions={renderRightActions}
      onSwipeableOpen={() => handleDelete(item)}
      overshootRight={false}
    >
      <Pressable
        style={[styles.card, isDark && styles.cardDark]}
        onPress={() => router.push(`/topic/${item.id}` as any)}
      >
        <View style={styles.cardHeader}>
          <Ionicons
            name={sourceIcon(item.source_type) as any}
            size={18}
            color={colors.blue}
            style={styles.sourceIcon}
          />
          <Text style={[styles.cardTitle, { color: colors.label }]} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
        <View style={styles.badges}>
          {item.has_memo ? (
            <View style={[styles.badge, styles.badgeMemo]}>
              <Text style={styles.badgeText}>Memo</Text>
            </View>
          ) : null}
          {item.quiz_count > 0 ? (
            <View style={[styles.badge, styles.badgeQuiz]}>
              <Text style={styles.badgeText}>Quiz ({item.quiz_count})</Text>
            </View>
          ) : null}
          {item.last_attempt_score != null ? (
            <View style={[styles.badge, styles.badgeScore]}>
              <Text style={styles.badgeText}>Score: {item.last_attempt_score}%</Text>
            </View>
          ) : null}
        </View>
        {item.category_names ? (
          <View style={styles.categoryRow}>
            {item.category_names.split(",").map((name) => (
              <View key={name} style={[styles.categoryChip, { backgroundColor: colors.tertiaryFill }]}>
                <Text style={[styles.categoryChipText, { color: colors.secondaryLabel }]}>{name}</Text>
              </View>
            ))}
          </View>
        ) : null}
        <Text style={[styles.cardDate, { color: colors.secondaryLabel }]}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </Pressable>
    </Swipeable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.systemGroupedBackground }]}>
      <TextInput
        style={[
          styles.searchInput,
          {
            backgroundColor: colors.tertiaryFill,
            color: colors.label,
          },
        ]}
        placeholder="Search topics…"
        placeholderTextColor={colors.tertiaryLabel}
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={loadTopics}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      <FlatList
        data={topics}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="library-outline" size={64} color={colors.gray3} />
            <Text style={[styles.emptyText, { color: colors.secondaryLabel }]}>No topics yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.tertiaryLabel }]}>Tap "New Topic" to get started</Text>
          </View>
        }
        contentContainerStyle={topics.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchInput: {
    margin: iOS18Components.horizontalPadding,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: iOS18Components.textFieldRadius,
    ...iOS18Typography.body,
  },
  card: {
    marginHorizontal: iOS18Components.horizontalPadding,
    marginBottom: 12,
    padding: iOS18Components.horizontalPadding,
    backgroundColor: "#fff",
    borderRadius: iOS18Components.cardRadius,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardDark: { backgroundColor: "#1C1C1E" },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  sourceIcon: { marginRight: 8 },
  cardTitle: { ...iOS18Typography.headline, flex: 1 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgeMemo: { backgroundColor: "rgba(52, 199, 89, 0.44)" },
  badgeQuiz: { backgroundColor: "rgba(0, 123, 255, 0.55)" },
  badgeScore: { backgroundColor: "rgba(255, 149, 0, 0.44)" },
  badgeText: { ...iOS18Typography.caption1, fontWeight: "500", color: "#ffffff" },
  cardDate: { ...iOS18Typography.caption1 },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 4 },
  categoryChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  categoryChipText: { ...iOS18Typography.caption2, fontWeight: "500" },
  deleteAction: {
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    width: iOS18Components.swipeActionWidth,
    marginBottom: 12,
    marginRight: iOS18Components.horizontalPadding,
    borderRadius: iOS18Components.cardRadius,
  },
  deleteActionText: { color: "#fff", ...iOS18Typography.caption1, fontWeight: "600", marginTop: 4 },
  empty: { alignItems: "center", paddingTop: 80 },
  emptyText: { ...iOS18Typography.headline, marginTop: 16 },
  emptySubtext: { ...iOS18Typography.footnote, marginTop: 4 },
  emptyList: { flexGrow: 1 },
});
