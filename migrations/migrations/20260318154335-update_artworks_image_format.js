const { imageSize } = require("image-size");

// --- 1. Your Configuration ---
const APPWRITE_ENDPOINT = "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID = "682272b1001e9d1609a8";
const BUCKET_ID = "6822733300074eb56561";

// --- 2. Helper Functions ---
function getAppwriteImageUrl(fileId) {
  return `${APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${PROJECT_ID}`;
}

async function getDimensionsFromUrl(url) {
  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Failed to fetch image: ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return imageSize(buffer);
  } catch (error) {
    console.error(`Error reading dimensions for ${url}:`, error.message);
    return null;
  }
}

function getRatioString(decimal, maxDenominator = 100) {
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
// --- 3. The Migration ---
module.exports = {
  async up(db, client) {
    console.log(
      "Starting UP migration: Calculating exact artwork aspect ratios...",
    );

    const artworksCollection = db.collection("artworkuploads");
    const cursor = artworksCollection.find({
      url: { $exists: true },
      image_format: { $exists: false },
    });

    while (await cursor.hasNext()) {
      const artwork = await cursor.next();

      const imageUrl = getAppwriteImageUrl(artwork.url);
      const dimensions = await getDimensionsFromUrl(imageUrl);

      if (!dimensions || !dimensions.width || !dimensions.height) {
        console.warn(`⚠️ Skipping ${artwork._id}: Could not parse dimensions.`);
        continue;
      }
      const exactDecimal = dimensions.width / dimensions.height;

      // Pass it through your logic to get the final { ratio, orientation } object
      const imageFormat = getRatioString(exactDecimal);

      if (!imageFormat) {
        console.warn(`⚠️ Skipping ${artwork._id}: Invalid ratio calculation.`);
        continue;
      }

      await artworksCollection.updateOne(
        { _id: artwork._id },
        { $set: { image_format: imageFormat } },
      );

      // We can use .toFixed(3) just to keep the console log readable!
      console.log(
        `✅ Updated ${artwork._id} -> ${(imageFormat.ratio, imageFormat.orientation)} )`,
      );

      // Optional: A tiny 50ms delay to prevent hammering the Appwrite server
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    console.log("Migration UP complete!");
  },

  async down(db, client) {
    console.log("Starting DOWN migration: Removing artwork aspect ratios...");

    const artworksCollection = db.collection("artworkuploads");

    const result = await artworksCollection.updateMany(
      { format: { $exists: true } },
      { $unset: { image_format: "" } },
    );

    console.log(
      `Migration DOWN complete! Removed 'format' from ${result.modifiedCount} artworks.`,
    );
  },
};
