import { contentHash, extractKeyTerms, extractSentences } from "./text-processing";

export type GeneratedQuestion = {
  questionText: string;
  questionType: "mcq" | "cloze" | "true_false";
  sourceHash: string;
  options: { text: string; isCorrect: boolean }[];
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function findClozeTarget(sentence: string, keyTerms: string[]): string | null {
  for (const term of keyTerms) {
    if (new RegExp(`\\b${escapeRegex(term)}\\b`, "i").test(sentence)) {
      return term;
    }
  }
  return null;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function generateClozeQuestions(
  sentences: string[],
  keyTerms: string[],
  hash: string,
  max: number,
): GeneratedQuestion[] {
  const questions: GeneratedQuestion[] = [];
  const used = new Set<number>();

  for (let i = 0; i < sentences.length && questions.length < max; i++) {
    if (used.has(i)) continue;
    const sentence = sentences[i];
    const target = findClozeTarget(sentence, keyTerms);
    if (!target) continue;

    used.add(i);
    const blank = sentence.replace(new RegExp(`\\b${escapeRegex(target)}\\b`, "i"), "______");

    const distractors = keyTerms.filter((t) => t.toLowerCase() !== target.toLowerCase()).slice(0, 3);
    if (distractors.length < 2) continue;

    questions.push({
      questionText: `Fill in the blank: ${blank}`,
      questionType: "cloze",
      sourceHash: hash,
      options: shuffle([{ text: target, isCorrect: true }, ...distractors.map((d) => ({ text: d, isCorrect: false }))]),
    });
  }
  return questions;
}

function generateTrueFalseQuestions(
  sentences: string[],
  keyTerms: string[],
  hash: string,
  max: number,
): GeneratedQuestion[] {
  const questions: GeneratedQuestion[] = [];

  for (let i = 0; i < sentences.length && questions.length < max; i++) {
    const sentence = sentences[i];
    if (sentence.length < 20 || sentence.length > 200) continue;

    // TRUE variant
    if (questions.length < max) {
      questions.push({
        questionText: `True or False: "${sentence}"`,
        questionType: "true_false",
        sourceHash: hash,
        options: [
          { text: "True", isCorrect: true },
          { text: "False", isCorrect: false },
        ],
      });
    }

    // FALSE variant: swap a key term
    if (questions.length < max) {
      const target = findClozeTarget(sentence, keyTerms);
      const replacement = keyTerms.find((t) => t.toLowerCase() !== target?.toLowerCase());
      if (target && replacement) {
        const falseSentence = sentence.replace(new RegExp(`\\b${escapeRegex(target)}\\b`, "i"), replacement);
        questions.push({
          questionText: `True or False: "${falseSentence}"`,
          questionType: "true_false",
          sourceHash: hash,
          options: [
            { text: "True", isCorrect: false },
            { text: "False", isCorrect: true },
          ],
        });
      }
    }
  }
  return questions;
}

function generateMCQQuestions(
  sentences: string[],
  keyTerms: string[],
  topicName: string,
  hash: string,
  max: number,
): GeneratedQuestion[] {
  const questions: GeneratedQuestion[] = [];

  for (let i = 0; i < keyTerms.length && questions.length < max; i++) {
    const term = keyTerms[i];
    const contextSentence = sentences.find((s) => new RegExp(`\\b${escapeRegex(term)}\\b`, "i").test(s));
    if (!contextSentence) continue;

    const distractors = keyTerms.filter((t) => t !== term).slice(0, 3);
    if (distractors.length < 2) continue;

    const blank = contextSentence.replace(new RegExp(`\\b${escapeRegex(term)}\\b`, "i"), "______");

    questions.push({
      questionText: `In the context of "${topicName}", which term best fits: "${blank}"?`,
      questionType: "mcq",
      sourceHash: hash,
      options: shuffle([{ text: term, isCorrect: true }, ...distractors.map((d) => ({ text: d, isCorrect: false }))]),
    });
  }
  return questions;
}

/**
 * Generate quiz questions from topic content using heuristics.
 * Works on all iOS versions — no AI model required.
 */
export function generateQuizQuestions(topicName: string, content: string, maxQuestions = 10): GeneratedQuestion[] {
  if (!content || content.trim().length < 50) return [];

  const sentences = extractSentences(content);
  if (sentences.length < 2) return [];

  const keyTerms = extractKeyTerms(content, 20);
  if (keyTerms.length < 3) return [];

  const hash = contentHash(content);

  const clozeMax = Math.ceil(maxQuestions * 0.4);
  const tfMax = Math.ceil(maxQuestions * 0.3);
  const mcqMax = maxQuestions - clozeMax - tfMax;

  const cloze = generateClozeQuestions(sentences, keyTerms, hash, clozeMax);
  const tf = generateTrueFalseQuestions(sentences, keyTerms, hash, tfMax);
  const mcq = generateMCQQuestions(sentences, keyTerms, topicName, hash, mcqMax);

  return shuffle([...cloze, ...tf, ...mcq]).slice(0, maxQuestions);
}
