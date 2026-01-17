import { describe, expect, it } from "vitest";
import { createWithUniqueValue } from "../src/createWithRetry";

describe("createWithUniqueValue", () => {
  it("retries on duplicate error and succeeds", async () => {
    const ids = ["dup", "dup", "ok"];
    let i = 0;

    const generate = () => ids[i++];

    const insert = async (value: string) => {
      if (value === "dup") {
        const err: any = new Error("duplicate");
        err.code = "23505"; // postgres duplicate
        throw err;
      }
      return { value };
    };

    const result = await createWithUniqueValue({
      generate,
      insert,
      isDuplicateError: (e: any) => e.code === "23505",
    });

    expect(result.value).toBe("ok");
  });

  it("throws non-duplicate errors immediately", async () => {
    const generate = () => "x";

    const insert = async () => {
      throw new Error("db down");
    };

    await expect(
      createWithUniqueValue({
        generate,
        insert,
        isDuplicateError: () => false,
      }),
    ).rejects.toThrow("db down");
  });
});
