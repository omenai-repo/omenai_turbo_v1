import {
  ArtistAlgorithmSchemaTypes,
  NotificationData,
} from "@omenai/shared-types";
import mongoose, { Schema, model, models } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const notificationHistorySchemaModel = new Schema<NotificationData>(
  {
    id: { type: String, index: true, default: () => uuidv4() },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    sent: { type: Boolean, required: true },
    sentAt: { type: Date, required: true },
    read: { type: Boolean, default: false },
    readAt: { type: Date || null, default: null },
  },
  { timestamps: true }
);

notificationHistorySchemaModel.index(
  { createdAt: 1 },
  { expireAfterSeconds: 2592000 }
);

export const NotificationHistory =
  mongoose.models.NotificationHistory ||
  mongoose.model("NotificationHistory", notificationHistorySchemaModel);
