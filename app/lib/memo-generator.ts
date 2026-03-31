import { contentHash, extractKeyTerms, extractSentences, getExcerpt } from "./text-processing";

export type GeneratedMemo = {
  content: string;
  sourceHash: string;
};

/**
 * Generate a structured memo following the Double Diamond design process:
 *   Discover → Define → Develop → Deliver
 *
 * Works on all iOS versions — no AI model required.
 */
export function generateMemo(topicName: string, content: string, references: string[] = []): GeneratedMemo {
  const sentences = extractSentences(content);
  const keyTerms = extractKeyTerms(content, 10);
  const hash = contentHash(content);

  if (sentences.length === 0) {
    return {
      content: `# ${topicName}\n\nNot enough content to generate a structured memo. Add more source material and regenerate.`,
      sourceHash: hash,
    };
  }

  // --- DISCOVER ---
  const discoverSection = [
    "## 🔍 Discover",
    "",
    `Key concepts identified in "${topicName}":`,
    "",
    ...keyTerms.map((t) => `- **${t}**`),
    "",
  ];

  // --- DEFINE ---
  const definitionSentences = sentences.slice(0, Math.min(3, sentences.length));
  const defineSection = ["## 🎯 Define", "", definitionSentences.join(" "), ""];

  // --- DEVELOP ---
  const developSentences = sentences.slice(3);
  const developSection = ["## 📝 Develop", ""];
  if (developSentences.length > 0) {
    for (const s of developSentences.slice(0, 10)) {
      developSection.push(`- ${s}`);
    }
    if (developSentences.length > 10) {
      developSection.push(`- *(${developSentences.length - 10} more points in source material)*`);
    }
  } else {
    developSection.push("*Add more source material to expand this section.*");
  }
  developSection.push("");

  // --- DELIVER ---
  const deliverSection = ["## ✅ Deliver", "", "**Key Takeaways:**", ""];
  for (const term of keyTerms.slice(0, 5)) {
    const ctx = sentences.find((s) => s.toLowerCase().includes(term));
    deliverSection.push(ctx ? `- **${term}**: ${getExcerpt(ctx, 100)}` : `- **${term}**`);
  }
  deliverSection.push("");

  // --- REFERENCES ---
  const refsSection: string[] = [];
  if (references.length > 0) {
    refsSection.push("## 📚 References", "");
    for (const ref of references) {
      refsSection.push(`- ${ref}`);
    }
    refsSection.push("");
  }

  const fullMemo = [
    `# ${topicName}`,
    "",
    ...discoverSection,
    ...defineSection,
    ...developSection,
    ...deliverSection,
    ...refsSection,
  ].join("\n");

  return { content: fullMemo, sourceHash: hash };
}
