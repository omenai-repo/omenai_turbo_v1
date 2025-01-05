import { ArtistSchemaTypes } from "@omenai/shared-types";
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
      default: () => "",
    },

    bio_video_link: {
      type: String,
      default: () => "",
    },
    bio: {
      type: String,
      required: true,
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
      default: {
        address_line: "",
        city: "",
        country: "",
        state: "",
        zip: "",
      },
    },
    categorization: {
      type: String,
      default: () => "",
    },
  },
  { timestamps: true }
);

export const AccountArtist =
  mongoose.models.AccountArtist ||
  mongoose.model("AccountArtist", artistSchemaDef);
