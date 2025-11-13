import {
  Client,
  Storage,
  ImageFormat,
  ImageGravity,
  ID,
  TablesDB,
} from "appwrite";

const client = new Client();
const serverClient = new Client();

const endpoint = "https://fra.cloud.appwrite.io/v1";

client
  .setEndpoint(endpoint)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_CLIENT_ID!);

serverClient.setEndpoint(endpoint).setProject(process.env.APPWRITE_CLIENT_ID!);

export const storage = new Storage(client);
export const serverStorage = new Storage(serverClient);

export const editorial_database = new TablesDB(client);
export const appwrite_image_format = ImageFormat;
export const appwrite_image_gravity = ImageGravity;
export const identifier = ID;
