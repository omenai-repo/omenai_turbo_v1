import { Text } from "@react-email/components";
import ArtistEmailLayout from "./ArtistEmailLayout";

const PriceReviewRequest = (artist_name: string) => {
  return (
    <ArtistEmailLayout artist_name={artist_name}>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        Dear {artist_name},
      </Text>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        We’re pleased to let you know that the price review you requested has
        been successfully submitted. Our team will carefully review it, and you
        can expect to receive feedback soon.
      </Text>

      <Text className="m-0 text-fluid-xxs font-semibold leading-[32px] text-gray-900">
        Thank you for your patience and for working with us. We’ll keep you
        updated as the process moves forward.
      </Text>
    </ArtistEmailLayout>
  );
};

export default PriceReviewRequest;
