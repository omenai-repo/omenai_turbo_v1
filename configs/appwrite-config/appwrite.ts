import {
  Client,
  Storage,
  ImageFormat,
  ImageGravity,
  ID,
  TablesDB,
} from "appwrite";

// -----------------------------------------------------------------------------
// 1. CLIENT-SIDE SETUP (Always runs)
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// 2. SERVER-SIDE SETUP (Lazy Loaded)
// -----------------------------------------------------------------------------

let serverClient: any = null;
let serverStorage: any = null;

if (typeof window === "undefined") {
  const { Client: NodeClient, Storage: NodeStorage } = require("node-appwrite");

  const internalClient = new NodeClient();

  // Use the PRIVATE server variables here
  internalClient
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_CLIENT_ID!)
    .setKey(process.env.APPWRITE_STORAGE_API_KEY!);

  serverClient = internalClient;
  serverStorage = new NodeStorage(internalClient);
}

export const nodeAppwriteClient = serverClient;
export const nodeAppwriteStorage = serverStorage;
