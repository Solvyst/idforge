export function isMongoDuplicate(err: any) {
  return err?.code === 11000; // E11000 duplicate key
}

export function isPostgresDuplicate(err: any) {
  return err?.code === "23505"; // unique_violation
}
