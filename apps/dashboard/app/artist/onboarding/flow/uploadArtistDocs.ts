import { documentation_storage } from "@omenai/appwrite-config/appwrite";
import { ID } from "appwrite";

const uploadArtistDocument = async (file: File) => {
  if (!file) return;
  const fileUploaded = await documentation_storage.createFile(
    process.env.NEXT_PUBLIC_APPWRITE_DOCUMENTATION_BUCKET_ID!,
    ID.unique(),
    file
  );
  return fileUploaded;
};

export default uploadArtistDocument;
