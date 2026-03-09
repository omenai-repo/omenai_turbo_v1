import { Text } from "@react-email/components";
import ArtistEmailLayout from "./ArtistEmailLayout";

const PriceReviewApproved = (artist_name: string) => {
  return (
    <ArtistEmailLayout artist_name={artist_name}>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        Dear {artist_name},
      </Text>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        We’re delighted to inform you that your price review request has been
        successfully approved. Your artwork has now been uploaded to the
        platform and is available for viewers to explore.
      </Text>

      <Text className="m-0 text-fluid-xxs font-semibold leading-[32px] text-gray-900">
        Thank you for sharing your creativity with us. We’re excited to see your
        work reach a wider audience.
      </Text>
    </ArtistEmailLayout>
  );
};

export default PriceReviewApproved;
