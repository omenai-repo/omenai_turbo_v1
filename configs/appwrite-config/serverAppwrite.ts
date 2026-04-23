import { Client as NodeClient, Storage as NodeStorage } from "node-appwrite";
let sStorage: any = null;

if (typeof window === "undefined") {
  const internalClient = new NodeClient();

  internalClient
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_CLIENT_ID!)
    .setKey(process.env.APPWRITE_STORAGE_API_KEY!);

  sStorage = new NodeStorage(internalClient);
}

export const serverStorage = sStorage;
