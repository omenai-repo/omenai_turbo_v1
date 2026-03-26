/**
 * Calculates the aspect ratio of an image File.
 * * @param file - The image File object from an input or drop event.
 * @returns A promise that resolves to the aspect ratio (width / height) as a number.
 */
export async function getImageAspectRatio(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    // 1. Verify the file is actually an image
    if (!file.type.startsWith("image/")) {
      reject(new Error("The provided file is not an image."));
      return;
    }

    // 2. Create an in-memory image and a temporary object URL
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    // 3. Set up the success handler
    img.onload = () => {
      const aspectRatio = img.width / img.height;

      // Clean up memory to avoid leaks
      URL.revokeObjectURL(objectUrl);
      resolve(aspectRatio);
    };

    // 4. Set up the error handler
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load the image file."));
    };

    // 5. Trigger the image load
    img.src = objectUrl;
  });
}

/**
 * Calculates the aspect ratio of an image from its URL.
 * @param url - The string URL of the image.
 * @returns A promise that resolves to the aspect ratio (width / height) as a number.
 */
export async function getAspectRatioFromUrl(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    // 1. Set up the success handler
    img.onload = () => {
      // Use naturalWidth and naturalHeight to get the true dimensions of the file
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      resolve(aspectRatio);
    };

    // 2. Set up the error handler
    img.onerror = () => {
      reject(new Error(`Failed to load the image from URL: ${url}`));
    };

    // 3. Trigger the image load
    img.src = url;
  });
}

/**
 * Converts a decimal aspect ratio into a readable string (e.g., "16:9").
 * @param decimal - The decimal aspect ratio (width / height).
 * @param maxDenominator - The highest denominator to check (100 is usually plenty).
 * @returns A string representing the ratio, like "16:9".
 */
export function getRatioString(
  decimal: number,
  maxDenominator: number = 100,
): { ratio: string; orientation: "landscape" | "portrait" | "square" } | null {
  if (decimal <= 0) return null;

  let bestNumerator = 1;
  let bestDenominator = 1;
  let smallestError = Math.abs(decimal - 1);

  for (let denominator = 1; denominator <= maxDenominator; denominator++) {
    // Guess the closest numerator for this denominator
    const numerator = Math.round(decimal * denominator);

    // Check how far off this fraction is from the actual decimal
    const currentError = Math.abs(decimal - numerator / denominator);

    if (currentError < smallestError) {
      bestNumerator = numerator;
      bestDenominator = denominator;
      smallestError = currentError;

      // If we find a nearly perfect match, stop searching early to save time
      if (currentError < 0.001) {
        break;
      }
    }
  }
  const orientation =
    bestNumerator > bestDenominator
      ? "landscape"
      : bestNumerator === bestDenominator
        ? "square"
        : "portrait";

  return { ratio: `${bestNumerator}:${bestDenominator}`, orientation };
}
