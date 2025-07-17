import { editorial_database } from "@omenai/appwrite-config";
import { Query } from "appwrite";

export async function listEditorials() {
  try {
    const response = editorial_database.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_COLLECTION_ID!
    );

    const result = (await response).documents;

    return { isOk: true, data: result };
  } catch (error) {
    return {
      isOk: false,
      message: "Something went wrong, please contact IT team",
    };
  }
}
