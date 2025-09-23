import { storage } from "@omenai/appwrite-config/appwrite";
import { ID } from "appwrite";

const uploadArtistDocument = async (file: File) => {
  if (!file) return;
  const fileUploaded = await storage.createFile({

    bucketId:process.env.NEXT_PUBLIC_APPWRITE_DOCUMENTATION_BUCKET_ID!,
    fileId: ID.unique(),
    file
  }
  );
  return fileUploaded;
};

export default uploadArtistDocument;
