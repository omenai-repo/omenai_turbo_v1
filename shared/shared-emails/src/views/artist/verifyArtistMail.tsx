import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import EmailFooter from "../../components/Footer";

const ArtistVerificationEmail = (username: string, token: string) => {
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
            <Heading className="text-dark text-fluid-lg font-light text-center p-0 mb-[20px] mx-0">
              Welcome on board to <strong>Omenai for Artists</strong>
            </Heading>
            <Text className="text-dark text-fluid-xxs leading-[24px]">
              Hello {username},
            </Text>
            <Text className="text-dark text-fluid-xxs leading-[24px]">
              We, at <strong>Omenai</strong>, are thrilled to have you on board
              and eagerly await the beginning of your journey with us
            </Text>
            <Text className="text-dark text-fluid-xxs leading-[24px]">
              Your email verification token is located below. Enter this code
              into the designated input field on the verification page. Please
              be aware that the validity of this token will expire in{" "}
              <strong>10 minutes.</strong>
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Text className="text-dark text-fluid-xxs font-light leading-[24px]">
                <strong>{token}</strong>
              </Text>
            </Section>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <EmailFooter recipientName={username} showSupportSection={false} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ArtistVerificationEmail;
