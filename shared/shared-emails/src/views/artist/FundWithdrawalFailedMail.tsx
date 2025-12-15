import { Text } from "@react-email/components";
import ArtistEmailLayout from "./ArtistEmailLayout";

const FundWithdrawalFailedMail = (artist_name: string, amount: string) => {
  return (
    <ArtistEmailLayout artist_name={artist_name}>
      <Text className="m-0 text-fluid-xxs font-semibold leading-[32px] text-gray-900">
        Hi {artist_name},
      </Text>
      <br />
      <Text className="m-0 text-fluid-xxs font-semibold leading-[32px] text-gray-900">
        We're reaching out to let you know that we encountered an issue while
        processing your withdrawal request of {amount}, and unfortunately, it
        could not be completed at this time.
      </Text>
      <br />
      <Text className="m-0 text-fluid-xxs font-semibold leading-[32px] text-gray-900">
        What happened? The most common reasons for withdrawal failures include:
      </Text>

      <ul>
        <li>
          <Text className="m-0 text-fluid-xxs leading-[28px] text-gray-900">
            Incorrect or outdated payment information
          </Text>
        </li>
        <li>
          <Text className="m-0 text-fluid-xxs leading-[28px] text-gray-900">
            Account restrictions or verification requirements from your
            financial institution
          </Text>
        </li>
        <li>
          <Text className="m-0 text-fluid-xxs leading-[28px] text-gray-900">
            Payment method temporarily unavailable
          </Text>
        </li>
      </ul>
      <Text className="m-0 text-fluid-xxs font-semibold leading-[32px] text-gray-900">
        What's next? Don't worry – your funds remain safely in your account
        balance. To complete your withdrawal, please:
      </Text>

      <ul>
        <li>
          <Text className="m-0 text-fluid-xxs leading-[28px] text-gray-900">
            Review and update your payment information in your account settings
          </Text>
        </li>
        <li>
          <Text className="m-0 text-fluid-xxs leading-[28px] text-gray-900">
            Ensure all account verification requirements are met
          </Text>
        </li>
        <li>
          <Text className="m-0 text-fluid-xxs leading-[28px] text-gray-900">
            Submit a new withdrawal request
          </Text>
        </li>
      </ul>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        We apologize for any inconvenience and are committed to helping you
        access your funds as quickly as possible. If you're unsure about what
        caused the issue or need assistance resolving it, our support team is
        here to help.
      </Text>
    </ArtistEmailLayout>
  );
};

export default FundWithdrawalFailedMail;
