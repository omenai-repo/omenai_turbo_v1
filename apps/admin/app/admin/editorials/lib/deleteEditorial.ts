import { editorial_database } from "@omenai/appwrite-config";
import { logRollbarServerError } from "@omenai/rollbar-config";
export async function deleteEditorialPiece(documentId: string) {
  try {
    const response = editorial_database.deleteRow({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_DATABASE_ID!,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_COLLECTION_ID!,
      rowId: documentId,
    });

    return { isOk: true, data: response };
  } catch (error) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message: "Something went wrong, please contact IT team",
    };
  }
}
