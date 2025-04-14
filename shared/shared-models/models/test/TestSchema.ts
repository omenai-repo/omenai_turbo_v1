import mongoose, { Schema } from "mongoose";

const testdb = new Schema(
  {
    title: { type: String, required: true },
  },

  { timestamps: true }
);

export const TestCollection =
  mongoose.models.TestCollection || mongoose.model("TestCollection", testdb);
