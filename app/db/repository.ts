import { type SQLiteDatabase } from "expo-sqlite";

// --- Types ---

export type Topic = {
  id: number;
  name: string;
  source_type: "name" | "text" | "url";
  raw_text: string | null;
  raw_url: string | null;
  source_snapshot: string | null;
  created_at: string;
  updated_at: string;
};

export type TopicWithMeta = Topic & {
  has_memo: number;
  quiz_count: number;
  last_attempt_score: number | null;
};

export type Memo = {
  id: number;
  topic_id: number;
  content: string;
  source_hash: string | null;
  generated_at: string;
  edited_at: string | null;
  is_edited: number;
};

export type Reference = {
  id: number;
  topic_id: number;
  url: string;
  title: string | null;
  added_at: string;
};

export type QuizQuestion = {
  id: number;
  topic_id: number;
  question_text: string;
  question_type: "mcq" | "cloze" | "true_false";
  source_hash: string | null;
  generated_at: string;
};

export type QuizOption = {
  id: number;
  question_id: number;
  option_text: string;
  is_correct: number;
};

export type QuizAttempt = {
  id: number;
  topic_id: number;
  score: number;
  total: number;
  completed_at: string;
};

// --- Topics ---

export async function createTopic(
  db: SQLiteDatabase,
  name: string,
  sourceType: Topic["source_type"],
  rawText?: string | null,
  rawUrl?: string | null,
  sourceSnapshot?: string | null,
): Promise<number> {
  const result = await db.runAsync(
    "INSERT INTO topics (name, source_type, raw_text, raw_url, source_snapshot) VALUES (?, ?, ?, ?, ?)",
    [name, sourceType, rawText ?? null, rawUrl ?? null, sourceSnapshot ?? null],
  );
  return result.lastInsertRowId;
}

export async function getTopic(db: SQLiteDatabase, id: number): Promise<Topic | null> {
  return db.getFirstAsync<Topic>("SELECT * FROM topics WHERE id = ?", [id]);
}

export async function listTopics(db: SQLiteDatabase): Promise<TopicWithMeta[]> {
  return db.getAllAsync<TopicWithMeta>(`
    SELECT t.*,
      (SELECT COUNT(*) > 0 FROM memos WHERE topic_id = t.id) as has_memo,
      (SELECT COUNT(*) FROM quiz_questions WHERE topic_id = t.id) as quiz_count,
      (SELECT CAST(score * 100.0 / total AS INTEGER)
       FROM quiz_attempts WHERE topic_id = t.id
       ORDER BY completed_at DESC LIMIT 1) as last_attempt_score
    FROM topics t
    ORDER BY t.updated_at DESC
  `);
}

export async function searchTopics(db: SQLiteDatabase, query: string): Promise<TopicWithMeta[]> {
  const pattern = `%${query}%`;
  return db.getAllAsync<TopicWithMeta>(
    `SELECT t.*,
      (SELECT COUNT(*) > 0 FROM memos WHERE topic_id = t.id) as has_memo,
      (SELECT COUNT(*) FROM quiz_questions WHERE topic_id = t.id) as quiz_count,
      (SELECT CAST(score * 100.0 / total AS INTEGER)
       FROM quiz_attempts WHERE topic_id = t.id
       ORDER BY completed_at DESC LIMIT 1) as last_attempt_score
    FROM topics t
    WHERE t.name LIKE ? OR t.raw_text LIKE ? OR t.source_snapshot LIKE ?
    ORDER BY t.updated_at DESC`,
    [pattern, pattern, pattern],
  );
}

export async function deleteTopic(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync("DELETE FROM topics WHERE id = ?", [id]);
}

export async function updateTopicContent(
  db: SQLiteDatabase,
  id: number,
  rawText?: string | null,
  sourceSnapshot?: string | null,
): Promise<void> {
  await db.runAsync(
    "UPDATE topics SET raw_text = COALESCE(?, raw_text), source_snapshot = COALESCE(?, source_snapshot), updated_at = datetime('now') WHERE id = ?",
    [rawText ?? null, sourceSnapshot ?? null, id],
  );
}

// --- References ---

export async function addReference(db: SQLiteDatabase, topicId: number, url: string, title?: string): Promise<number> {
  const result = await db.runAsync("INSERT INTO refs (topic_id, url, title) VALUES (?, ?, ?)", [
    topicId,
    url,
    title ?? null,
  ]);
  return result.lastInsertRowId;
}

export async function getReferences(db: SQLiteDatabase, topicId: number): Promise<Reference[]> {
  return db.getAllAsync<Reference>("SELECT * FROM refs WHERE topic_id = ? ORDER BY added_at DESC", [topicId]);
}

export async function deleteReference(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync("DELETE FROM refs WHERE id = ?", [id]);
}

// --- Memos ---

export async function saveMemo(
  db: SQLiteDatabase,
  topicId: number,
  content: string,
  sourceHash: string,
): Promise<number> {
  await db.runAsync("DELETE FROM memos WHERE topic_id = ?", [topicId]);
  const result = await db.runAsync("INSERT INTO memos (topic_id, content, source_hash) VALUES (?, ?, ?)", [
    topicId,
    content,
    sourceHash,
  ]);
  return result.lastInsertRowId;
}

export async function getMemo(db: SQLiteDatabase, topicId: number): Promise<Memo | null> {
  return db.getFirstAsync<Memo>("SELECT * FROM memos WHERE topic_id = ? ORDER BY generated_at DESC LIMIT 1", [topicId]);
}

export async function updateMemo(db: SQLiteDatabase, memoId: number, content: string): Promise<void> {
  await db.runAsync("UPDATE memos SET content = ?, edited_at = datetime('now'), is_edited = 1 WHERE id = ?", [
    content,
    memoId,
  ]);
}

// --- Quiz Questions ---

export async function saveQuizQuestions(
  db: SQLiteDatabase,
  topicId: number,
  questions: {
    questionText: string;
    questionType: string;
    sourceHash: string;
    options: { text: string; isCorrect: boolean }[];
  }[],
): Promise<void> {
  await db.withTransactionAsync(async () => {
    const existingIds = await db.getAllAsync<{ id: number }>("SELECT id FROM quiz_questions WHERE topic_id = ?", [
      topicId,
    ]);
    for (const { id } of existingIds) {
      await db.runAsync("DELETE FROM quiz_options WHERE question_id = ?", [id]);
    }
    await db.runAsync("DELETE FROM quiz_questions WHERE topic_id = ?", [topicId]);

    for (const q of questions) {
      const result = await db.runAsync(
        "INSERT INTO quiz_questions (topic_id, question_text, question_type, source_hash) VALUES (?, ?, ?, ?)",
        [topicId, q.questionText, q.questionType, q.sourceHash],
      );
      const questionId = result.lastInsertRowId;
      for (const opt of q.options) {
        await db.runAsync("INSERT INTO quiz_options (question_id, option_text, is_correct) VALUES (?, ?, ?)", [
          questionId,
          opt.text,
          opt.isCorrect ? 1 : 0,
        ]);
      }
    }
  });
}

export async function getQuizQuestions(
  db: SQLiteDatabase,
  topicId: number,
): Promise<(QuizQuestion & { options: QuizOption[] })[]> {
  const questions = await db.getAllAsync<QuizQuestion>("SELECT * FROM quiz_questions WHERE topic_id = ? ORDER BY id", [
    topicId,
  ]);
  const result: (QuizQuestion & { options: QuizOption[] })[] = [];
  for (const q of questions) {
    const options = await db.getAllAsync<QuizOption>("SELECT * FROM quiz_options WHERE question_id = ? ORDER BY id", [
      q.id,
    ]);
    result.push({ ...q, options });
  }
  return result;
}

// --- Quiz Attempts ---

export async function saveQuizAttempt(
  db: SQLiteDatabase,
  topicId: number,
  score: number,
  total: number,
): Promise<number> {
  const result = await db.runAsync("INSERT INTO quiz_attempts (topic_id, score, total) VALUES (?, ?, ?)", [
    topicId,
    score,
    total,
  ]);
  return result.lastInsertRowId;
}

export async function getQuizAttempts(db: SQLiteDatabase, topicId: number): Promise<QuizAttempt[]> {
  return db.getAllAsync<QuizAttempt>("SELECT * FROM quiz_attempts WHERE topic_id = ? ORDER BY completed_at DESC", [
    topicId,
  ]);
}
