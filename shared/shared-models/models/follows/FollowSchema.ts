import { FollowTypes } from "@omenai/shared-types";
import mongoose, { Schema, model } from "mongoose";

const FollowSchema = new Schema<FollowTypes>(
  {
    follower: {
      type: String,
      ref: "User",
      required: true,
      index: true,
    },
    followingId: {
      type: String,
      required: true,
      refPath: "followingType",
    },
    followingType: {
      type: String,
      required: true,
      enum: ["artist", "gallery"],
    },
  },
  { timestamps: true },
);

// Compound index to prevent duplicate follows and speed up queries
FollowSchema.index({ follower: 1, followingId: 1 }, { unique: true });
// Index for finding all followers of a specific gallery/artist
FollowSchema.index({ followingId: 1, followingType: 1 });

export const Follow =
  mongoose.models.Follow || model<FollowTypes>("Follow", FollowSchema);
