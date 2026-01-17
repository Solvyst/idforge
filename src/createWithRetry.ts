export type DuplicateErrorDetector = (err: unknown) => boolean;

export async function createWithUniqueValue<T>(args: {
  generate: () => string;
  insert: (value: string) => Promise<T>;
  isDuplicateError: DuplicateErrorDetector;
  maxAttempts?: number;
}): Promise<T> {
  const { generate, insert, isDuplicateError, maxAttempts = 10 } = args;

  for (let i = 0; i < maxAttempts; i++) {
    const value = generate();
    try {
      return await insert(value);
    } catch (err) {
      if (isDuplicateError(err)) continue;
      throw err;
    }
  }

  throw new Error(
    `Failed to create after ${maxAttempts} attempts due to duplicates`,
  );
}
