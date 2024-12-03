import { AccountAdminSchemaTypes } from "@omenai/shared-types";
import mongoose, { Schema, model, models } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const adminAccountSchema = new Schema<AccountAdminSchemaTypes>(
  {
    name: {
      type: String,
      required: true,
      min: 3,
      max: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    admin_id: {
      type: String,
      default: () => uuidv4(),
    },

    // verified: {
    //   type: Boolean,
    //   required: true,
    //   default: () => false,
    // },

    role: {
      type: String,
      default: "admin",
    },
  },
  { timestamps: true }
);

export const AccountAdmin =
  mongoose.models.AccountAdmin ||
  mongoose.model("AccountAdmin", adminAccountSchema);
