import { editorial_storage } from "@omenai/appwrite-config";
import { ID } from "appwrite";

const uploadEditorialCoverImage = async (file: File) => {
  if (!file) return;
  const fileUploaded = await editorial_storage.createFile(
    process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_BUCKET_ID!,
    ID.unique(),
    file
  );
  return fileUploaded;
};

export default uploadEditorialCoverImage;
