import { promotional_storage } from "@omenai/appwrite-config";
import { ID } from "appwrite";

const uploadPromotionalContentImage = async (file: File) => {
  if (!file) return;
  const fileUploaded = await promotional_storage.createFile(
    process.env.NEXT_PUBLIC_APPWRITE_PROMOTIONAL_BUCKET_ID!,
    ID.unique(),
    file
  );
  return fileUploaded;
};

export default uploadPromotionalContentImage;
