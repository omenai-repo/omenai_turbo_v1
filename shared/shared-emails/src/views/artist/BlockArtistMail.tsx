import { Text } from "@react-email/components";
import ArtistEmailLayout from "./ArtistEmailLayout";

const BlockArtistMail = (artist_name: string) => {
  return (
    <ArtistEmailLayout artist_name={artist_name}>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        Dear {artist_name},
      </Text>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        We wanted to inform you that your artist account has been temporarily
        suspended. This action was taken due to a violation of our community
        guidelines.
      </Text>

      <Text className="m-0 text-fluid-xxs font-semibold leading-[32px] text-gray-900">
        Please note that during this time, you will not be able to access your
        artist dashboard, upload new content, or receive payments.
      </Text>
      <Text className="m-0 text-fluid-xxs font-semibold leading-[32px] text-gray-900">
        If you believe this action was made in error or would like to resolve
        the issue, please contact our support team. We’ll be happy to review
        your case and help you restore access as soon as possible.
      </Text>
    </ArtistEmailLayout>
  );
};

export default BlockArtistMail;
