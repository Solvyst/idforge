export type ExistsFn = (value: string) => Promise<boolean>;

export async function genUniqueValue(args: {
  generate: () => string;
  exists: ExistsFn;
  maxAttempts?: number;
}): Promise<string> {
  const { generate, exists, maxAttempts = 10 } = args;

  for (let i = 0; i < maxAttempts; i++) {
    const value = generate();
    if (!(await exists(value))) return value;
  }

  throw new Error(
    `Failed to generate unique value after ${maxAttempts} attempts`,
  );
}
