import {
  Client,
  Storage,
  ImageFormat,
  ImageGravity,
  ID,
  TablesDB,
} from "appwrite";
import {
  Client as ServerClient,
  Storage as ServerStorage,
} from "node-appwrite";

const client = new Client();
const serverClient = new Client();

const environment = process.env.APP_ENV as string;

if (!environment) {
  throw new Error("APPWRITE_ENDPOINT is not defined");
}

const endpoint =
  environment === "production"
    ? "https://sfo.cloud.appwrite.io/v1"
    : "https://fra.cloud.appwrite.io/v1";

client
  .setEndpoint(endpoint)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_CLIENT_ID!);

serverClient.setEndpoint(endpoint).setProject(process.env.APPWRITE_CLIENT_ID!);

export const nodeAppwriteClient = new ServerClient()
  .setEndpoint(endpoint)
  .setProject(process.env.APPWRITE_CLIENT_ID!)
  .setKey(process.env.APPWRITE_STORAGE_API_KEY!);

export const nodeAppwriteStorage = new ServerStorage(nodeAppwriteClient);

export const storage = new Storage(client);
export const serverStorage = new Storage(serverClient);

export const editorial_database = new TablesDB(client);
export const appwrite_image_format = ImageFormat;
export const appwrite_image_gravity = ImageGravity;
export const identifier = ID;
