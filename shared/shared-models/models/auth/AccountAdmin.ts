import { AccountAdminSchemaTypes } from "@omenai/shared-types";
import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const adminAccountSchema = new Schema<AccountAdminSchemaTypes>(
  {
    name: {
      type: String,
      min: 3,
      max: 50,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      default: "",
    },

    admin_id: {
      type: String,
      default: () => uuidv4(),
    },

    verified: {
      type: Boolean,
      default: () => false,
    },

    role: {
      type: String,
      default: "admin",
    },
    access_role: {
      type: String,
      enum: ["admin", "owner", "editor", "viewer"],
      required: true,
    },
    admin_active: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const AccountAdmin =
  mongoose.models.AccountAdmin ||
  mongoose.model("AccountAdmin", adminAccountSchema);
