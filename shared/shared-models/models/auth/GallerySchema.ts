import { GallerySchemaTypes } from "@omenai/shared-types";
import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const gallerySignupSchema = new Schema<GallerySchemaTypes>(
  {
    name: {
      type: String,
      required: true,
      min: 3,
      unique: true,
    },

    address: {
      type: Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      required: true,
      min: 3,
    },
    phone: { type: String, default: () => "" },
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
    subscription_status: {
      type: Schema.Types.Mixed,
      required: true,
      default: () => {
        return {
          type: null,
          active: false,
          discount: {
            active: true,
            plan: "pro",
          },
        };
      },
    },
    status: {
      type: String,
      default: "active",
    },
    connected_account_id: {
      type: String,
      default: () => null,
    },
    stripe_customer_id: { type: String, default: () => null },
  },
  { timestamps: true },
);

export const AccountGallery =
  mongoose.models.AccountGallery ||
  mongoose.model("AccountGallery", gallerySignupSchema);
