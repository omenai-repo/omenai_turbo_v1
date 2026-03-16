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
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import EmailFooter from "../../components/Footer";

const VerifyArtistMail = (artist_name?: string) => {
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
              Dear Admin,
            </Text>
            <Text className="text-dark text-fluid-xxs leading-[24px]">
              You have received a new Artist verification request from the
              following user on the platform: <strong>{artist_name}.</strong>{" "}
              Please take the necessary steps to review and verify the Artist
              information on your admin dashboard.
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

export default VerifyArtistMail;
