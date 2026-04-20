// /src/utils/generateGhostArtistStub.ts
import { ArtistSchemaTypes } from "@omenai/shared-types";
import { v4 as uuidv4 } from "uuid";

export const generateGhostArtistStub = (
  name: string,
): Partial<ArtistSchemaTypes> => {
  return {
    name: name,
    profile_status: "ghost",
    artist_id: uuidv4(),
    verified: false,
    artist_verified: false,
    isOnboardingCompleted: false,
    role: "artist",
    // Base currency and empty arrays satisfy the schema defaults
    base_currency: "USD",
    logo: "",
    bio: "",
    art_style: [],
    // Provide a completely empty address object that matches your AddressTypes
    address: {
      country: "",
      city: "",
      state: "",
      zip: "",
      address_line: "",
      countryCode: "",
      stateCode: "",
    },
  };
};
