import { InvoiceTypes } from "@omenai/shared-types";
import { models, Schema, model } from "mongoose";

const invoiceSchema = new Schema<InvoiceTypes>(
  {
    invoiceNumber: { type: String, required: true, index: true },
    recipient: {
      userId: { type: String, required: true },
      address: { type: Schema.Types.Mixed, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    orderId: { type: String, required: true, index: true },
    currency: { type: String, required: true, index: true },
    lineItems: {
      description: { type: String, required: true },
      quantity: { type: Number, required: true, default: 1 },
      unitPrice: { type: Number, required: true },
    },
    pricing: {
      taxes: { type: Number, required: true },
      shipping: { type: Number, required: true },
      unitPrice: { type: Number, required: true },
      total: { type: Number, required: true },
      discount: { type: Number, required: false },
    },
    storage: {
      provider: { type: String, enum: ["appwrite"], default: "appwrite" },
      fileId: { type: String },
      url: { type: String },
    },
    paidAt: { type: Date, required: true },
    document_created: { type: Boolean, default: false },
    receipt_sent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Invoice = models.Invoice || model("Invoice", invoiceSchema);
