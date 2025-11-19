import { editorial_database } from "@omenai/appwrite-config";
import logRollbarServerError from "@omenai/shared-lib/rollbar/logRollbarServerError";
import { Query } from "appwrite";

export async function listEditorials() {
  try {
    const response = editorial_database.listRows({
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_DATABASE_ID!,
      tableId: process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_COLLECTION_ID!,
    });

    const result = (await response).rows;

    return { isOk: true, data: result };
  } catch (error) {
    logRollbarServerError(error);
    return {
      isOk: false,
      message: "Something went wrong, please contact IT team",
    };
  }
}
