import mongoose from "mongoose";

export const connectMongoDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection.asPromise(); // Return existing connection
  }

  return await mongoose.connect(process.env.MONGODB_URI as string); // Connect if not already connected
};
