import { GallerySchemaTypes } from "@omenai/shared-types";
import mongoose, { Schema, model, models } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const gallerySignupSchema = new Schema<GallerySchemaTypes>(
  {
    name: {
      type: String,
      required: true,
      min: 3,
      unique: true,
    },

    location: {
      type: Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      required: true,
      min: 3,
    },
    admin: {
      type: String,
      required: true,
      min: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      min: 8,
      max: 16,
    },
    verified: {
      type: Boolean,
      required: true,
      default: () => false,
    },
    gallery_verified: {
      type: Boolean,
      required: true,
      default: () => false,
    },
    role: {
      type: String,
      default: "gallery",
    },
    gallery_id: {
      type: String,
      default: () => uuidv4(),
      index: true,
    },
    logo: {
      type: String,
      required: true,
    },
    subscription_active: {
      type: Boolean,
      required: true,
      default: () => false,
    },
    status: {
      type: String,
      default: () => "active",
    },
    connected_account_id: {
      type: String,
      default: () => null,
    },
  },
  { timestamps: true }
);

export const AccountGallery =
  mongoose.models.AccountGallery ||
  mongoose.model("AccountGallery", gallerySignupSchema);
