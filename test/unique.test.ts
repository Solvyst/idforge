import { describe, expect, it } from "vitest";
import { genUniqueValue } from "../src/unique";

describe("genUniqueValue", () => {
  it("returns first non-existing value", async () => {
    const taken = new Set(["a", "b"]);

    const generate = () => "c";
    const exists = async (v: string) => taken.has(v);

    const value = await genUniqueValue({
      generate,
      exists,
    });

    expect(value).toBe("c");
  });

  it("retries until unique value found", async () => {
    const values = ["a", "b", "c"];
    let i = 0;

    const generate = () => values[i++];
    const exists = async (v: string) => v !== "c";

    const value = await genUniqueValue({
      generate,
      exists,
      maxAttempts: 5,
    });

    expect(value).toBe("c");
  });

  it("throws if unique value not found", async () => {
    const generate = () => "x";
    const exists = async () => true;

    await expect(
      genUniqueValue({
        generate,
        exists,
        maxAttempts: 3,
      }),
    ).rejects.toThrow("Failed to generate unique value");
  });
});
