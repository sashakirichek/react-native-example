import {
  contentHash,
  extractKeyTerms,
  extractSentences,
  getExcerpt,
  normalizeText,
  stripHtml,
} from "../app/lib/text-processing";

describe("normalizeText", () => {
  it("collapses multiple whitespace and trims", () => {
    expect(normalizeText("  hello   world  ")).toBe("hello world");
  });

  it("normalizes line breaks", () => {
    expect(normalizeText("line1\r\n\r\nline2\n\nline3")).toBe("line1\nline2\nline3");
  });

  it("handles empty string", () => {
    expect(normalizeText("")).toBe("");
  });
});

describe("extractSentences", () => {
  it("splits text on sentence boundaries", () => {
    const text = "React Native is a framework. It lets you build mobile apps. You can use JavaScript for this purpose.";
    const sentences = extractSentences(text);
    expect(sentences.length).toBe(3);
    expect(sentences[0]).toBe("React Native is a framework.");
  });

  it("filters out very short segments", () => {
    const text = "Hi. OK. This is a longer sentence that passes.";
    const sentences = extractSentences(text);
    expect(sentences.length).toBe(1);
    expect(sentences[0]).toContain("longer sentence");
  });
});

describe("extractKeyTerms", () => {
  it("returns frequent non-stop words", () => {
    const text =
      "React Native uses JavaScript. React enables component-based architecture. JavaScript runs the bridge.";
    const terms = extractKeyTerms(text, 5);
    expect(terms).toContain("react");
    expect(terms).toContain("javascript");
  });

  it("excludes stop words", () => {
    const terms = extractKeyTerms("the is a an are was were to for with", 10);
    expect(terms.length).toBe(0);
  });

  it("limits to maxTerms", () => {
    const text = "apple banana cherry date elderberry fig grape honeydew kiwi lemon";
    const terms = extractKeyTerms(text, 3);
    expect(terms.length).toBe(3);
  });
});

describe("contentHash", () => {
  it("returns consistent hash for same input", () => {
    const h1 = contentHash("hello world");
    const h2 = contentHash("hello world");
    expect(h1).toBe(h2);
  });

  it("returns different hash for different input", () => {
    const h1 = contentHash("hello");
    const h2 = contentHash("world");
    expect(h1).not.toBe(h2);
  });

  it("returns a hex string", () => {
    expect(contentHash("test")).toMatch(/^[0-9a-f]+$/);
  });
});

describe("stripHtml", () => {
  it("removes HTML tags", () => {
    expect(stripHtml("<p>Hello <b>world</b></p>")).toBe("Hello world");
  });

  it("removes script and style blocks", () => {
    const html = '<div>Content</div><script>alert("x")</script><style>.a{color:red}</style><p>More</p>';
    expect(stripHtml(html)).toBe("Content More");
  });

  it("decodes common entities", () => {
    expect(stripHtml("A &amp; B &lt; C &gt; D")).toBe("A & B < C > D");
  });
});

describe("getExcerpt", () => {
  it("returns full text if under maxLength", () => {
    expect(getExcerpt("short", 100)).toBe("short");
  });

  it("truncates at word boundary with ellipsis", () => {
    const text = "This is a longer text that should be truncated at a word boundary";
    const excerpt = getExcerpt(text, 30);
    expect(excerpt.length).toBeLessThanOrEqual(31); // 30 + ellipsis char
    expect(excerpt.endsWith("…")).toBe(true);
    expect(excerpt).not.toContain("truncated"); // word cut off
  });
});
