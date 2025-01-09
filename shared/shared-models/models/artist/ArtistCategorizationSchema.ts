import { ArtistAlgorithmSchemaTypes } from "@omenai/shared-types";
import mongoose, { Schema, model, models } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const artistCategorizationSchema = new Schema<ArtistAlgorithmSchemaTypes>(
  {
    params: {type: Schema.Types.Mixed, required: true},
    pricing: {type: Schema.Types.Mixed, required: true},
    categorization: {type: String, required: true},
    artist_id: {type: String, required: true, index: true},
    id: {type: String, index: true, default: () => uuidv4()}
  },
  { timestamps: true }
);

export const ArtistCategorization =
  mongoose.models.ArtistCategorization ||
  mongoose.model("ArtistCategorization", artistCategorizationSchema);
