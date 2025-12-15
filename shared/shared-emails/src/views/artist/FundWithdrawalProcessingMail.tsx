import { Text } from "@react-email/components";
import ArtistEmailLayout from "./ArtistEmailLayout";

const FundWithdrawalProcessingMail = (artist_name: string, amount: string) => {
  return (
    <ArtistEmailLayout artist_name={artist_name}>
      <Text className="m-0 text-fluid-xxs font-semibold leading-[32px] text-gray-900">
        Hi {artist_name},
      </Text>
      <Text className="m-0 text-fluid-xxs font-semibold leading-[32px] text-gray-900">
        We're writing to confirm that your withdrawal request for {amount} has
        been received and is currently being processed.
      </Text>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        Your funds are on their way! Processing times may vary depending on your
        payment method and financial institution. You'll receive another
        notification once the transfer has been completed.
      </Text>
    </ArtistEmailLayout>
  );
};

export default FundWithdrawalProcessingMail;
