import { editorial_database } from "@omenai/appwrite-config";
export async function deleteEditorialPiece(documentId: string) {
  try {
    const response = editorial_database.deleteDocument(
      process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_COLLECTION_ID!,
      documentId
    );

    return { isOk: true, data: response };
  } catch (error) {
    return {
      isOk: false,
      message: "Something went wrong, please contact IT team",
    };
  }
}
