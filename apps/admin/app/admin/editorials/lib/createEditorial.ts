import { editorial_database } from "@omenai/appwrite-config";
import { identifier } from "@omenai/appwrite-config";
import logRollbarServerError from "@omenai/shared-lib/rollbar/logRollbarServerError";
import { EditorialSchemaTypes } from "@omenai/shared-types";
export async function createEditorialPiece(editorial: EditorialSchemaTypes) {
  try {
    const response = editorial_database.createRow({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_DATABASE_ID!,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_COLLECTION_ID!,
      rowId: identifier.unique(),
      data: editorial,
    });

    return { isOk: true, data: response };
  } catch (error) {
    if (error instanceof Error) {
      logRollbarServerError(error);
    } else {
      logRollbarServerError(error);
    }
    return {
      isOk: false,
      message: "Something went wrong, please contact IT team",
    };
  }
}
