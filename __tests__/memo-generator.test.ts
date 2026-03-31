import { generateMemo } from "../app/lib/memo-generator";

const SAMPLE_CONTENT = `
React Native is a popular framework for building mobile applications. It was created by Facebook and released in 2015. React Native allows developers to write mobile apps using JavaScript and React. The framework provides a bridge between JavaScript code and native platform APIs.

Components in React Native are similar to React web components. They use JSX syntax and follow a component-based architecture. State management in React Native can use useState hooks or external libraries like Redux. Navigation between screens is handled by libraries such as React Navigation or Expo Router.

Performance optimization in React Native involves techniques like memoization, lazy loading, and avoiding unnecessary re-renders. The new architecture introduces Fabric for improved rendering and TurboModules for faster native module access.
`;

describe("generateMemo", () => {
  it("generates a structured memo with Double Diamond sections", () => {
    const result = generateMemo("React Native", SAMPLE_CONTENT);
    expect(result.content).toContain("# React Native");
    expect(result.content).toContain("## 🔍 Discover");
    expect(result.content).toContain("## 🎯 Define");
    expect(result.content).toContain("## 📝 Develop");
    expect(result.content).toContain("## ✅ Deliver");
  });

  it("includes a sourceHash for change detection", () => {
    const result = generateMemo("Test", SAMPLE_CONTENT);
    expect(result.sourceHash).toBeTruthy();
    expect(typeof result.sourceHash).toBe("string");
  });

  it("consistent hash for same content", () => {
    const r1 = generateMemo("Test", SAMPLE_CONTENT);
    const r2 = generateMemo("Test", SAMPLE_CONTENT);
    expect(r1.sourceHash).toBe(r2.sourceHash);
  });

  it("different hash for different content", () => {
    const r1 = generateMemo("A", "Content A is about programming.");
    const r2 = generateMemo("B", "Content B is about cooking recipes.");
    expect(r1.sourceHash).not.toBe(r2.sourceHash);
  });

  it("handles empty content gracefully", () => {
    const result = generateMemo("Empty Topic", "");
    expect(result.content).toContain("# Empty Topic");
    expect(result.content).toContain("Not enough content");
  });

  it("includes references when provided", () => {
    const result = generateMemo("Test", SAMPLE_CONTENT, ["https://reactnative.dev", "https://expo.dev"]);
    expect(result.content).toContain("📚 References");
    expect(result.content).toContain("https://reactnative.dev");
    expect(result.content).toContain("https://expo.dev");
  });

  it("omits references section when none provided", () => {
    const result = generateMemo("Test", SAMPLE_CONTENT);
    expect(result.content).not.toContain("📚 References");
  });
});
