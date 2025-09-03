import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Tailwind,
  Text,
} from "@react-email/components";

const SubscriptionPaymentFailedMail = (name: string) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Img
              src="https://fra.cloud.appwrite.io/v1/storage/buckets/68227462000f77619b04/files/68b8ccd6000dedf704d5/view?project=682273fc00235a5bdb6c"
              width="120"
              height="20"
              alt="Omenai logo"
              className="mx-auto mt-10"
            />

            <Heading className="text-black text-fluid-md font-semibold text-center p-0 mb-[30px] mx-0">
              Action Needed: Update Your Payment Details
            </Heading>

            <Text className="text-black text-fluid-xs leading-[24px]">
              Hello <strong>{name}</strong>,
            </Text>

            <Text className="text-black text-fluid-xs leading-[24px]">
              We hope you're doing well. We're reaching out to let you know that
              your recent subscription payment attempt was unsuccessful.
            </Text>

            <Text className="text-black text-fluid-xs leading-[24px]">
              To avoid any interruptions in your access, please update your
              payment information at your earliest convenience.
            </Text>

            <Button
              href="https://dashboard.omenai.app/gallery/billing"
              className="bg-black text-white text-fluid-xs font-medium px-5 py-3 rounded mt-[20px] mb-[10px] mx-auto block text-center"
            >
              Update Payment Info
            </Button>

            <Text className="text-black text-fluid-xs leading-[24px]">
              Your account and data remain secure during this time, but
              subscription access will be paused until payment is resolved.
            </Text>

            <Text className="text-black text-fluid-xs leading-[24px]">
              For any assistance, please contact our support team at{" "}
              <Link
                href="mailto:contact@omenani.net"
                className="underline text-blue-800 italic"
              >
                contact@omenani.net
              </Link>
              .
            </Text>

            <Text className="text-black text-fluid-xs leading-[24px]">
              Thank you for your attention to this matter. We appreciate your
              continued support and look forward to having you back as an active
              subscriber.
            </Text>

            <Text className="text-black text-fluid-xs leading-[24px]">
              Warm regards, <br />
              Moses from Omenai
            </Text>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            <Text className="text-dark text-[12px] leading-[24px]">
              Please note: this email is intended solely for{" "}
              <span className="text-black">{name}</span>. If you received it in
              error, please delete it and notify us immediately. This message
              may contain confidential or legally privileged information.
              Unauthorized use or distribution is strictly prohibited.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default SubscriptionPaymentFailedMail;
