import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Tailwind,
  Text,
} from "@react-email/components";
import EmailFooter from "../../components/Footer";

const RejectArtistMail = (artist_name?: string) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Img
              src={
                "https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/696ee3b60025e2a2c4ff/view?project=682272b1001e9d1609a8"
              }
              width="120"
              height="20"
              alt="Omenai logo"
              className="mx-auto my-10"
            />

            <Text className="text-dark text-fluid-xxs leading-[24px]">
              Dear {artist_name},
            </Text>
            <Text className="text-dark text-fluid-xxs leading-[24px]">
              Thank you for registering with Omenai After reviewing your
              account, we regret to inform you that your verification request
              has not been approved.
            </Text>
            <Text className="text-dark text-fluid-xxs leading-[24px]">
              Due to this, you will no longer be able to register for an account
              on our platform without further assistance. If you believe this
              decision was made in error or if you would like to discuss your
              account further, please contact our support team at{" "}
              <Link
                href="mailto:support@omenai.app"
                className="text-dark font-bold underline"
              >
                support@omenai.app
              </Link>
              , and we will be happy to assist you.
            </Text>

            <Text className="text-fluid-xxs leading-[24px]">
              We appreciate your interest in OMENAI Inc, and we are here to
              address any questions or concerns you may have.
            </Text>

            <br />
            <Text className="text-fluid-xxs leading-[24px]">
              Best regards, <br /> The Omenai team
            </Text>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <EmailFooter
              recipientName={artist_name}
              showSupportSection={false}
            />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default RejectArtistMail;
