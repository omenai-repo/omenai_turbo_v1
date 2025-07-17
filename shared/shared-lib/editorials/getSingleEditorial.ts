import { editorial_database } from "@omenai/appwrite-config";
import { Query } from "appwrite";

export async function getEditorial(id: string, slug: string) {
  try {
    const response = await editorial_database.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_COLLECTION_ID!,
      id
      //   [Query.equal("slug", slug)]
    );

    const result = response;

    return { isOk: true, data: result };
  } catch (error) {
    return {
      isOk: false,
      message: "Something went wrong, please contact IT team",
    };
  }
}
