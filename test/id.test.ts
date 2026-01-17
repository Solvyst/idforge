import { describe, expect, it } from "vitest";
import { createIdGenerator } from "../src/id";

describe("createIdGenerator", () => {
  it("generates id with default length", () => {
    const gen = createIdGenerator();
    const id = gen();

    expect(id).toBeTypeOf("string");
    expect(id.length).toBe(10);
  });

  it("respects custom length", () => {
    const gen = createIdGenerator({ length: 16 });
    const id = gen();

    expect(id.length).toBe(16);
  });

  it("adds prefix when provided", () => {
    const gen = createIdGenerator({ prefix: "prov_" });
    const id = gen();

    expect(id.startsWith("prov_")).toBe(true);
  });

  it("uses safe alphabet (no confusing chars)", () => {
    const gen = createIdGenerator();
    const id = gen();

    expect(id).not.toMatch(/[01ilo]/i);
  });
});
