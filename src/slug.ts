export type SlugifyOptions = {
  maxLen?: number;
};

export function slugify(input: string, opts: SlugifyOptions = {}) {
  const maxLen = opts.maxLen ?? 60;

  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLen);
}
