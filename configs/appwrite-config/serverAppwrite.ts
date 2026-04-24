import {
  Client as NodeClient,
  Storage as NodeStorage,
  TablesDB,
  Query,
} from "node-appwrite";
let sStorage: any = null;
let tablesDB: any = null;

if (typeof window === "undefined") {
  const internalClient = new NodeClient();

  tablesDB = new TablesDB(internalClient);

  internalClient
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_CLIENT_ID!)
    .setKey(process.env.APPWRITE_STORAGE_API_KEY!);

  sStorage = new NodeStorage(internalClient);
}

export const serverStorage = sStorage;
export const serverDatabases = tablesDB;
export const sQuery = Query;
