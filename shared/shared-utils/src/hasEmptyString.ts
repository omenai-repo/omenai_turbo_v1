export function hasEmptyString(obj: Record<string, any>): boolean {
  return Object.values(obj).some(
    (value) => typeof value === "string" && value === ""
  );
}
