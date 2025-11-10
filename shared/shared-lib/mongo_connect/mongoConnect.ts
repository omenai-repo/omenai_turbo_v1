import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;
if (!MONGO_URI)
  throw new Error("Please define the MONGO_URI environment variable");

// Extend the Node.js global type so TypeScript knows about our cache
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

export async function connectMongoDB() {
  // Initialize cache if it doesn't exist
  const cached =
    global.mongooseCache ||
    (global.mongooseCache = { conn: null, promise: null });

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, { bufferCommands: false })
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
