import { describe, expect, it } from "vitest";
import { genUniqueSlug } from "../src/uniqueSlug";

describe("genUniqueSlug", () => {
  it("adds suffix on collision", async () => {
    const taken = new Set<string>(["john-doe", "john-doe-2"]);
    const exists = async (v: string) => taken.has(v);

    const slug = await genUniqueSlug({ input: "John Doe", exists });
    expect(slug).toBe("john-doe-3");
  });
});
