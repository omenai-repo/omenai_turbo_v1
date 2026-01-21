import { getApiUrl, auth_uri } from "@omenai/url-config/src/config";
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
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

const PasswordRecoveryEmail = (
  username: string,
  token: string,
  route: string,
) => {
  const url = auth_uri();
  return (
    <Html>
      <Head />
      <Tailwind>
        <Preview>Password Reset verification</Preview>
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
              Dear {username},
            </Text>
            <Text className="text-dark text-fluid-xxs leading-[24px]">
              We have received a request to reset your password. Below, you will
              find your verification link. Please note that the validity of this
              link will expire in <strong>10 minutes.</strong>
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Text className="text-dark text-fluid-xxs font-normal leading-[24px]">
                <strong>{`${url}/reset/${route}/${token}`}</strong>
              </Text>
            </Section>

            <Text className="text-dark text-fluid-xxs leading-[24px]">
              If you did not authorize this action. Please contact us
              immediately on{" "}
              <Link
                href="mailto:contact@omeani.net"
                className="underline text-blue-800"
              >
                contact@omeani.net
              </Link>
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-dark text-[12px] leading-[24px]">
              Please be advised that the information contained within this email
              was directed exclusively to{" "}
              <span className="text-dark">{username} </span>. In the event that
              you were not anticipating the receipt of this email, we
              respectfully request that you refrain from taking any action based
              on its contents. This communication may contain confidential and
              legally privileged information, and it is intended solely for the
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

export default PasswordRecoveryEmail;
