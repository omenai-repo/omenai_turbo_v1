import { Schema, model, models } from "mongoose";

type CodeSchemaTypes = {
  token: string;
  author: string;
};
const tokenSchema = new Schema<CodeSchemaTypes>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    author: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

tokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 172800 });

export const AdminInviteToken =
  models.AdminInviteToken || model("AdminInviteToken", tokenSchema);
