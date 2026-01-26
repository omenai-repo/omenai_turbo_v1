import mongoose, { Schema, Model, models } from "mongoose";
import { ISupportTicket, SupportCategory } from "@omenai/shared-types";
const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    userId: { type: String, index: true }, // Index for fast lookup of a user's history
    userEmail: { type: String, required: true },
    userType: {
      type: String,
      enum: ["GUEST", "USER", "ARTIST", "GALLERY"],
      default: "GUEST",
    },

    category: {
      type: String,
      enum: [
        "GENERAL",
        "PAYMENT",
        "ORDER",
        "SUBSCRIPTION",
        "PAYOUT",
        "WALLET",
        "AUTH",
        "UPLOAD",
        "CHECKOUT",
      ],
      required: true,
    },
    message: { type: String, required: true },

    pageUrl: { type: String },
    priority: {
      type: String,
      enum: ["LOW", "NORMAL", "HIGH", "CRITICAL"],
      default: "NORMAL",
    },
    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
      default: "OPEN",
      index: true, // Index for your Admin Dashboard filtering
    },
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    meta: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },

    referenceId: { type: String, index: true },

    resolvedAt: { type: Date },
  },
  { timestamps: true }, // Automatically adds createdAt, updatedAt
);

SupportTicketSchema.pre("save", function (next) {
  if (this.isNew) {
    const highPriorityCategories: SupportCategory[] = [
      "PAYMENT",
      "PAYOUT",
      "WALLET",
      "SUBSCRIPTION",
    ];

    if (highPriorityCategories.includes(this.category as SupportCategory)) {
      this.priority = "HIGH";
    }
  }
  next();
});

// Prevent model recompilation errors in Next.js hot-reload
const SupportTicket: Model<ISupportTicket> =
  models.SupportTicket || mongoose.model("SupportTicket", SupportTicketSchema);

export default SupportTicket;
