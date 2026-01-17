import { customAlphabet } from "nanoid";

export type IdGenOptions = {
  alphabet?: string;
  length?: number;
  prefix?: string;
};

const DEFAULT_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

export function createIdGenerator(opts: IdGenOptions = {}) {
  const alphabet = opts.alphabet ?? DEFAULT_ALPHABET;
  const length = opts.length ?? 10;
  const prefix = opts.prefix ?? "";

  const nano = customAlphabet(alphabet, length);
  return () => prefix + nano();
}
