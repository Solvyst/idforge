import type { ExistsFn } from "./unique.js";
import { slugify } from "./slug.js";

export async function genUniqueSlug(args: {
  input: string;
  exists: ExistsFn;
  maxLen?: number;
  maxAttempts?: number;
}): Promise<string> {
  const { input, exists, maxLen = 60, maxAttempts = 50 } = args;

  const base = slugify(input, { maxLen });
  if (!base) throw new Error("Slug base is empty");

  if (!(await exists(base))) return base;

  for (let i = 2; i <= maxAttempts; i++) {
    const suffix = `-${i}`;
    const cut = Math.max(1, maxLen - suffix.length);
    const candidate = `${base.slice(0, cut)}${suffix}`;
    if (!(await exists(candidate))) return candidate;
  }

  throw new Error(
    `Failed to generate unique slug after ${maxAttempts} attempts`,
  );
}
