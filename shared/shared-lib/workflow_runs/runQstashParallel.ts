export async function runQstashInParallel<T>(
  tasks: Promise<T>[],
  options?: {
    swallowErrors?: boolean;
    label?: string;
  }
): Promise<T[]> {
  try {
    return await Promise.all(tasks);
  } catch (error) {
    if (options?.swallowErrors) {
      console.warn(`[runInParallel] Some tasks failed:`, error);
      return []; // or partial results if you modify the pattern
    }

    console.error(`[runInParallel] Task group "${options?.label}" failed.`);
    throw error;
  }
}
