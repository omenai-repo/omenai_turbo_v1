import { getApiUrl } from "@omenai/url-config/src/config";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";

const PaymentPendingMail = (name: string, artwork: string) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Preview>Payment Transaction Pending</Preview>

        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Img
              src={
                "https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/68d2ab83002025087b36/view?project=682272b1001e9d1609a8"
              }
              width="100"
              height="20"
              alt="Omenai logo"
              className="mx-auto mt-10"
            />

            <Text className="text-dark text-fluid-xxs leading-[24px]">
              <strong>Dear {name},</strong>
            </Text>
            <Text className="text-dark text-fluid-xxs leading-[24px]">
              Thank you for your recent order of ${artwork}! Your payment is
              currently being processed. You'll receive a confirmation email
              once your payment has been confirmed.
            </Text>

            <Text className="text-dark text-fluid-xxs leading-[24px]">
              As always, if you have any questions, feedback, or concerns
              regarding your Order or any other aspect of our service, please
              feel free to reach out to us at{" "}
              <Link
                href="mailto:contact@omenani.net"
                className="underline text-dark italic font-bold"
              >
                contact@omeani.net
              </Link>
              . Our dedicated customer support team is available to assist you
              and ensure your experience remains exceptional.{" "}
            </Text>
            <Text className="text-dark text-fluid-xxs leading-[24px]">
              Once again, thank you for choosing <strong>Omenai</strong> We
              appreciate your business and look forward to serving you.
            </Text>
            <Text className="text-dark text-fluid-xxs leading-[24px]">
              Best regards, <br />
              Moses from Omenai
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-dark text-[12px] leading-[24px]">
              Please be advised that the information contained within this email
              was directed exclusively to{" "}
              <span className="text-dark">{name} </span>. In the event that you
              were not anticipating the receipt of this email, we respectfully
              request that you refrain from taking any action based on its
              contents. This communication may contain confidential and legally
              privileged information, and it is intended solely for the
              designated recipient. Unauthorized access, use, or dissemination
              of this email is strictly prohibited. If you have received this
              email in error, we kindly ask that you promptly inform us and
              delete it from your communication systems. Your prompt attention
              to this matter is greatly appreciated. Thank you
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PaymentPendingMail;
