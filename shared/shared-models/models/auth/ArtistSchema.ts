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

    profile_status: {
      type: String,
      enum: ["claimed", "ghost"],
      default: "claimed",
      index: true,
    },

    email: {
      type: String,
      sparse: true,
      unique: true,
      required: function (this: any) {
        return this.profile_status === "claimed";
      },
    },
    password: {
      type: String,
      required: function (this: any) {
        return this.profile_status === "claimed";
      },
    },

    phone: { type: String, default: () => "" },

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
      default: () => "",
      required: function (this: any) {
        return this.profile_status === "claimed";
      },
    },
    birthyear: { type: String, default: () => "" },
    country_of_origin: { type: String, default: () => "" },

    bio_video_link: { type: String, default: () => "" },
    bio: { type: String, default: () => "" },
    algo_data_id: { type: String, default: () => "" },
    wallet_id: { type: String, default: () => "" },

    base_currency: {
      type: String,
      default: "USD",
      required: function (this: any) {
        return this.profile_status === "claimed";
      },
    },

    role: { type: String, default: "artist" },

    address: {
      type: Schema.Types.Mixed,
      required: function (this: any) {
        return this.profile_status === "claimed";
      },
    },
    categorization: { type: String, default: () => "" },

    art_style: {
      type: Schema.Types.Mixed,
      default: [],
      required: function (this: any) {
        return this.profile_status === "claimed";
      },
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
    // Typo maintained per your database constraints
    registeration_tracking: {
      type: Schema.Types.Mixed,
      default: () => ({
        ip_address: "Unknown",
        country: "Unknown",
        city: "Unknown",
        device_type: "unknown",
        os: "Unknown",
        browser: "Unknown",
        referrer: "direct",
      }),
    },
    followerCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const AccountArtist =
  mongoose.models.AccountArtist ||
  mongoose.model("AccountArtist", artistSchemaDef);
