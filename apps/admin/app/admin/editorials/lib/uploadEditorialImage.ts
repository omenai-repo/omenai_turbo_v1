import { editorial_storage, identifier } from "@omenai/appwrite-config";

export async function uploadEditorialImage(image: File) {
  try {
    const response = await editorial_storage.createFile(
      process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_BUCKET_ID!,
      identifier.unique(),
      image
    );
    return { isOk: true, data: response };
  } catch (error) {
    return {
      isOk: false,
      message:
        "Something went wrong with editorial image upload, please contact IT team",
    };
  }
}
