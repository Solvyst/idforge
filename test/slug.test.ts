import { describe, expect, it } from "vitest";
import { slugify } from "../src/slug";

describe("slugify", () => {
  it("slugifies basic input", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("trims and collapses symbols", () => {
    expect(slugify("  A@@@B   C  ")).toBe("a-b-c");
  });

  it("respects maxLen", () => {
    const s = slugify("a ".repeat(100), { maxLen: 10 });
    expect(s.length).toBeLessThanOrEqual(10);
  });
});
