import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

// 1. Define the shape of our cached object on the global scope
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// 2. Augment the NodeJS 'global' object for type safety
declare global {
  // Use 'var' to define the global property
  var mongoose: MongooseCache | undefined;
}

// 3. Initialize the global cache if it doesn't exist.
// We use 'global.mongoose ??=' to initialize it safely once.
global.mongoose = global.mongoose ?? { conn: null, promise: null };

/**
 * We use the non-null assertion operator (!) here
 * because we are certain the line above has initialized global.mongoose.
 * This guarantees 'cached' is of type MongooseCache.
 */
let cached: MongooseCache = global.mongoose!;

export async function connectMongoDB(): Promise<Mongoose> {
  // 1. If we have a cached connection, reuse it
  if (cached.conn) {
    return cached.conn;
  }

  // 2. If a connection promise is NOT in progress, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Recommended for serverless architectures
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  // 3. Wait for the in-progress promise to resolve, and cache the connection
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // If connection fails, clear the promise to allow retries
    cached.promise = null;
    throw e;
  }

  return cached.conn!;
}
