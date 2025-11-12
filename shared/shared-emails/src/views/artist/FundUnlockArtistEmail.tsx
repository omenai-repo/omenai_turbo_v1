import React from "react";
import ArtistEmailLayout from "./ArtistEmailLayout";
import { Text } from "@react-email/components";

export default function FundUnlockArtistEmail(
  artist_name: string,
  amount: number
) {
  return (
    <ArtistEmailLayout artist_name={artist_name}>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        Dear {artist_name},
      </Text>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        We’re happy to let you know that a portion of your funds has been
        unlocked and moved from your pending balance to your available balance.
        Great news — your funds have been successfully unlocked and are now
        available for withdrawal in your account. You can access them at any
        time through your dashboard.
      </Text>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        <strong>Amount available:</strong> {amount}
      </Text>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        These funds are now ready for withdrawal, and you can initiate a payout
        anytime from your dashboard. Any remaining pending funds will continue
        to clear according to the standard process.
      </Text>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        If you have any questions about your balance or the withdrawal process,
        feel free to reach out — we’re here to help.
      </Text>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        Thank you for your patience and for being part of{" "}
        <strong>Omenai</strong>.
      </Text>
    </ArtistEmailLayout>
  );
}
