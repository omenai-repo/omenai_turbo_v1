import {
  ArtistDocumentationTypes,
  ArtistSchemaTypes,
} from "@omenai/shared-types";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const now = new Date();
const resetDate = new Date(now);
resetDate.setMonth(now.getMonth() + 1);

const artistSchemaDef = new Schema<ArtistSchemaTypes>(
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
    phone: { type: String, default: () => "" },
    password: {
      type: String,
      required: true,
    },

    artist_id: {
      type: String,
      default: () => uuidv4(),
      index: true,
    },

    verified: {
      type: Boolean,
      required: true,
      default: () => false,
      index: true,
    },

    artist_verified: {
      type: Boolean,
      default: () => false,
      required: true,
      index: true,
    },
    logo: {
      type: String,
      required: true,
    },

    bio_video_link: {
      type: String,
      default: () => "",
    },
    bio: {
      type: String,
      default: () => "",
    },

    algo_data_id: {
      type: String,
      default: () => "",
    },
    wallet_id: {
      type: String,
      default: () => "",
    },
    base_currency: { type: String, required: true },

    role: {
      type: String,
      default: "artist",
    },
    address: {
      type: Schema.Types.Mixed,
      required: true,
    },
    categorization: {
      type: String,
      default: () => "",
    },
    art_style: {
      type: Schema.Types.Mixed,
      required: true,
    },
    documentation: {
      type: Schema.Types.Mixed,
      default: (): ArtistDocumentationTypes => {
        return {
          cv: "",
          socials: { instagram: "", twitter: "", facebook: "", linkedin: "" },
        };
      },
      required: true,
    },
    isOnboardingCompleted: {
      type: Boolean,
      default: () => false,
      index: true,
    },
    exclusivity_uphold_status: {
      isBreached: { type: Boolean, default: false },
      incident_count: { type: Number, default: 0 },
    },
    pricing_allowances: {
      auto_approvals_used: { type: Number, default: 0 },
      last_reset_date: { type: Date, default: toUTCDate(resetDate) },
    },
  },
  { timestamps: true },
);

export const AccountArtist =
  mongoose.models.AccountArtist ||
  mongoose.model("AccountArtist", artistSchemaDef);
