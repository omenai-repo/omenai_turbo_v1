import {
  ArtistDocumentationTypes,
  ArtistSchemaTypes,
} from "@omenai/shared-types";
import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

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
    },

    artist_verified: {
      type: Boolean,
      default: () => false,
      required: true,
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
    },
  },
  { timestamps: true }
);

export const AccountArtist =
  mongoose.models.AccountArtist ||
  mongoose.model("AccountArtist", artistSchemaDef);
