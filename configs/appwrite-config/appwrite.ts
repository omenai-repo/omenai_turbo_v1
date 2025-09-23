import {
  Client,
  Storage,
  Databases,
  ImageFormat,
  ImageGravity,
  ID,
  TablesDB
} from "appwrite";

const client = new Client();
const endpoint = "https://cloud.appwrite.io/v1";

client
  .setEndpoint(endpoint)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_CLIENT_ID!);

export const storage = new Storage(client);


export const editorial_database = new TablesDB(client);
export const appwrite_image_format = ImageFormat;
export const appwrite_image_gravity = ImageGravity;
export const identifier = ID;
