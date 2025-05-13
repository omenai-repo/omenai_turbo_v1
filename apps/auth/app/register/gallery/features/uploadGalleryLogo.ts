import { logo_storage } from "@omenai/appwrite-config/appwrite";
import { ID } from "appwrite";

const uploadGalleryLogoContent = async (file: File) => {
  if (!file) return;
  const fileUploaded = await logo_storage.createFile(
    process.env.NEXT_PUBLIC_APPWRITE_LOGO_BUCKET_ID!,
    ID.unique(),
    file
  );
  return fileUploaded;
};

export default uploadGalleryLogoContent;
