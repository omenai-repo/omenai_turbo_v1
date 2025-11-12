import React from "react";
import ArtistEmailLayout from "./ArtistEmailLayout";
import { Text } from "@react-email/components";

export default function FundUnlockArtistEmail(artist_name: string) {
  return (
    <ArtistEmailLayout artist_name={artist_name}>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        Dear {artist_name},
      </Text>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        Great news — your funds have been successfully unlocked and are now
        available in your account. You can access them at any time through your
        dashboard.
      </Text>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        Thank you for your patience and for being part of{" "}
        <strong>Omenai</strong>.
      </Text>
    </ArtistEmailLayout>
  );
}
