import { storage, identifier } from "@omenai/appwrite-config";

const uploadImage = async (file: File) => {
  if (!file) return;
  const fileUploaded = await storage.createFile(
    process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
    identifier.unique(),
    file
  );
  return fileUploaded;
};

export default uploadImage;
