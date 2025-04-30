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
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

const PasswordRecoveryEmail = (
  username: string,
  token: string,
  route: string
) => {
  const url = auth_uri();
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Img
              src={
                "https://fra.cloud.appwrite.io/v1/storage/buckets/66aa1aa0001a0c51d892/files/68028808001793765300/view?project=66aa198b0038ad614178&mode=admin"
              }
              width="120"
              height="20"
              alt="Omenai logo"
              className="mx-auto my-10"
            />
            <Heading className="text-black text-fluid-lg font-normal text-center p-0 mb-[20px] mx-0">
              Password Reset verification
            </Heading>
            <Text className="text-black text-fluid-xs leading-[24px]">
              Dear {username},
            </Text>
            <Text className="text-black text-fluid-xs leading-[24px]">
              We have received a request to reset your password. Below, you will
              find your verification link. Please note that the validity of this
              link will expire in <strong>10 minutes.</strong>
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Text className="text-black text-fluid-xs font-normal leading-[24px]">
                <strong>{`${url}/reset/${route}/${token}`}</strong>
              </Text>
            </Section>

            <Text className="text-black text-fluid-xs leading-[24px]">
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
              <span className="text-black">{username} </span>. In the event that
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
