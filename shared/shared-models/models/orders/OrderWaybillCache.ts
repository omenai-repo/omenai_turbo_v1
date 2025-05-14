import { WaybillCacheTypes } from "@omenai/shared-types";
import mongoose, { Schema } from "mongoose";

const waybillCache = new Schema<WaybillCacheTypes>(
  {
    order_id: { type: String, required: true, unique: true },
    pdf_base64: { type: String, required: true },
  },
  { timestamps: true }
);

export const WaybillCache =
  mongoose.models.WaybillCache || mongoose.model("WaybillCache", waybillCache);
