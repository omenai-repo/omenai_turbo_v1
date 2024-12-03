export function catalogChunk<T>(arr: T[], n: number): T[][] {
  if (!arr || !Array.isArray(arr)) {
    throw new Error("Input must be an array");
  }
  if (n <= 0 || !Number.isInteger(n)) {
    throw new Error("Chunk size must be a positive integer");
  }
  if (arr.length === 0) {
    return [];
  }

  const baseChunkSize = Math.floor(arr.length / n);
  const remainder = arr.length % n;

  let chunks: T[][] = [];
  let startIndex = 0;

  for (let i = 0; i < n; i++) {
    const currentChunkSize = baseChunkSize + (i < remainder ? 1 : 0);
    const endIndex = startIndex + currentChunkSize;
    chunks.push(arr.slice(startIndex, endIndex));
    startIndex = endIndex;
  }

  return chunks;
}
