import { getApiUrl } from "@omenai/url-config/src/config";
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

const AcceptArtistMail = (artist_name?: string) => {
  const url = getApiUrl();
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Img
              src={
                "https://cloud.appwrite.io/v1/storage/buckets/66aa1aa0001a0c51d892/files/679292dc001c0e14f322/view?project=66aa198b0038ad614178&project=66aa198b0038ad614178&mode=admin"
              }
              width="120"
              height="20"
              alt="Omenai logo"
              className="mx-auto my-10"
            />

            <Text className="text-dark text-[14px] leading-[24px]">
              Dear {artist_name},
            </Text>
            <Text className="text-dark text-[14px] leading-[24px]">
              We are excited to inform you that your Artist account has been
              successfully verified on <strong>OMENAI INC.</strong> You can now
              fully access all the features of our platform and start showcasing
              your artwork to our community of art enthusiasts.
            </Text>

            <Text className="m-0 text-[14px] font-semibold leading-[32px] text-gray-900">
              What next?
            </Text>

            <ul>
              <li>
                <Text className="m-0 text-[14px] leading-[28px] text-gray-900">
                  <Link href={`${url}/auth/login`}>Login</Link> to your artist
                  account.
                </Text>
              </li>
              <li>
                <Text className="m-0 text-[14px] leading-[28px] text-gray-900">
                  Complete your onboarding process via your dashboard
                </Text>
              </li>
              <li>
                <Text className="m-0 text-[14px] leading-[28px] text-gray-900">
                  Upload your latest artworks and manage your gallery.
                </Text>
              </li>
              <li>
                <Text className="m-0 text-[14px] leading-[28px] text-gray-900">
                  Connect with potential buyers and art lovers.
                </Text>
              </li>
            </ul>

            <Text className="text-[14px] leading-[24px]">
              Thank you for your patience during the verification process. If
              you have any questions or need assistance, feel free to reach out
              to us at{" "}
              <Link
                href="mailto:contact@omenai.net"
                className="text-dark font-bold underline"
              >
                contact@omenai.net
              </Link>
            </Text>
            <Text className="text-[14px] leading-[24px]">
              We look forward to seeing your beautiful creations!
            </Text>
            <br />
            <Text className="text-[14px] leading-[24px]">
              Best regards, <br /> The Omenai team
            </Text>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-dark text-[12px] leading-[24px]">
              Please be advised that the information contained within this email
              was directed exclusively to{" "}
              <span className="text-dark">{artist_name} </span>. In the event
              that you were not anticipating the receipt of this email, we
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

export default AcceptArtistMail;
