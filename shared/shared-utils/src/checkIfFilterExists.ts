export function hasFilterValue(
  data: { name: string; label: string; value: string }[],
  nameToFind: string
): boolean {
  // Use the `some` method to check if at least one object has a matching name
  return data.some((obj) => obj.name === nameToFind);
}
