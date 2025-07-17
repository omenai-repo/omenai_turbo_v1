import { editorial_database } from "@omenai/appwrite-config";
import { identifier } from "@omenai/appwrite-config";
import { EditorialFormData, EditorialSchemaTypes } from "@omenai/shared-types";
export async function createEditorialPiece(editorial: EditorialSchemaTypes) {
  try {
    const response = editorial_database.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_COLLECTION_ID!,
      identifier.unique(),
      editorial
    );

    return { isOk: true, data: response };
  } catch (error) {
    return {
      isOk: false,
      message: "Something went wrong, please contact IT team",
    };
  }
}
