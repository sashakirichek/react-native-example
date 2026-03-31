import { generateQuizQuestions } from "../app/lib/quiz-generator";

const SAMPLE_CONTENT = `
React Native is a popular framework for building mobile applications. It was created by Facebook and released in 2015. React Native allows developers to write mobile apps using JavaScript and React. The framework provides a bridge between JavaScript code and native platform APIs.

Components in React Native are similar to React web components. They use JSX syntax and follow a component-based architecture. State management in React Native can use useState hooks or external libraries like Redux. Navigation between screens is handled by libraries such as React Navigation or Expo Router.

Performance optimization in React Native involves techniques like memoization, lazy loading, and avoiding unnecessary re-renders. The new architecture introduces Fabric for improved rendering and TurboModules for faster native module access. Hermes is a JavaScript engine optimized specifically for React Native applications.
`;

describe("generateQuizQuestions", () => {
  it("generates questions from sufficient content", () => {
    const questions = generateQuizQuestions("React Native", SAMPLE_CONTENT, 10);
    expect(questions.length).toBeGreaterThan(0);
    expect(questions.length).toBeLessThanOrEqual(10);
  });

  it("returns empty array for insufficient content", () => {
    expect(generateQuizQuestions("Short", "Too short.", 5)).toEqual([]);
  });

  it("returns empty array for empty content", () => {
    expect(generateQuizQuestions("Empty", "", 5)).toEqual([]);
  });

  it("generates questions with valid structure", () => {
    const questions = generateQuizQuestions("React Native", SAMPLE_CONTENT, 5);
    for (const q of questions) {
      expect(q.questionText).toBeTruthy();
      expect(["mcq", "cloze", "true_false"]).toContain(q.questionType);
      expect(q.sourceHash).toBeTruthy();
      expect(q.options.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("each MCQ/cloze question has exactly one correct answer", () => {
    const questions = generateQuizQuestions("React Native", SAMPLE_CONTENT, 10);
    for (const q of questions) {
      const correctCount = q.options.filter((o) => o.isCorrect).length;
      expect(correctCount).toBe(1);
    }
  });

  it("respects maxQuestions limit", () => {
    const questions = generateQuizQuestions("React Native", SAMPLE_CONTENT, 3);
    expect(questions.length).toBeLessThanOrEqual(3);
  });
});
