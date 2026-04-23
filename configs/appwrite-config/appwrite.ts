import {
  Client,
  Storage,
  ImageFormat,
  ImageGravity,
  ID,
  TablesDB,
} from "appwrite";

const client = new Client();

if (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_CLIENT_ID!);
}

export const storage = new Storage(client);
export const editorial_database = new TablesDB(client);
export const appwrite_image_format = ImageFormat;
export const appwrite_image_gravity = ImageGravity;
export const identifier = ID;
