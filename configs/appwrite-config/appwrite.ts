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

const serverEndpoint = process.env.APPWRITE_ENDPOINT as string;
const clientEndPoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string;

client
  .setEndpoint(clientEndPoint)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_CLIENT_ID!);

serverClient
  .setEndpoint(serverEndpoint)
  .setProject(process.env.APPWRITE_CLIENT_ID!);

export const nodeAppwriteClient = new ServerClient()
  .setEndpoint(serverEndpoint)
  .setProject(process.env.APPWRITE_CLIENT_ID!)
  .setKey(process.env.APPWRITE_STORAGE_API_KEY!);

export const nodeAppwriteStorage = new ServerStorage(nodeAppwriteClient);

export const storage = new Storage(client);
export const serverStorage = new Storage(serverClient);

export const editorial_database = new TablesDB(client);
export const appwrite_image_format = ImageFormat;
export const appwrite_image_gravity = ImageGravity;
export const identifier = ID;
