import { Text } from "@react-email/components";
import ArtistEmailLayout from "./ArtistEmailLayout";

const FundWithdrawalSuccessMail = (artist_name: string, amount: string) => {
  return (
    <ArtistEmailLayout artist_name={artist_name}>
      <Text className="m-0 text-fluid-xxs font-semibold leading-[32px] text-gray-900">
        Hi {artist_name},
      </Text>
      <Text className="m-0 text-fluid-xxs font-semibold leading-[32px] text-gray-900">
        Great news! Your withdrawal has been completed successfully. We've
        processed your request and transferred the funds to your designated
        account.
      </Text>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        {amount} have been transferred to your account and should appear shortly
        depending on your financial institution's processing time.
      </Text>
    </ArtistEmailLayout>
  );
};

export default FundWithdrawalSuccessMail;
