import { ArtistAlgorithmSchemaTypes } from "@omenai/shared-types";
import mongoose, { Schema, model, models } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const artistCategorization = new Schema<ArtistAlgorithmSchemaTypes>(
  {
    artist_id: { type: String, required: true },
    current: { type: Schema.Types.Mixed, default: () => null },
    id: { type: String, index: true, default: () => uuidv4() },
    history: { type: Schema.Types.Mixed, default: () => [] },
    request: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const ArtistCategorization =
  mongoose.models.ArtistCategorization ||
  mongoose.model("ArtistCategorization", artistCategorization);
