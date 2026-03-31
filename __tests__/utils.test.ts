import { isValidUrl, formatDate } from "../app/utils";

describe("isValidUrl", () => {
  it("accepts valid http URLs", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
  });

  it("accepts valid https URLs", () => {
    expect(isValidUrl("https://reactnative.dev/docs")).toBe(true);
  });

  it("rejects non-http protocols", () => {
    expect(isValidUrl("ftp://files.example.com")).toBe(false);
  });

  it("rejects plain text", () => {
    expect(isValidUrl("not a url")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidUrl("")).toBe(false);
  });
});

describe("formatDate", () => {
  it("formats ISO date string", () => {
    const result = formatDate("2025-06-15T10:30:00");
    expect(result).toBeTruthy();
    expect(result).toContain("2025");
  });
});
