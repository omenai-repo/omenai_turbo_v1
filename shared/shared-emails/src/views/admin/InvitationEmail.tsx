import { auth_uri } from "@omenai/url-config/src/config";
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

const InvitationEmail = (
  name: string,
  inviteCode: string,
  email: string,
  entity: string
) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Img
              src={
                "https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/68d2ab83002025087b36/view?project=682272b1001e9d1609a8"
              }
              width="120"
              height="20"
              alt="Omenai logo"
              className="mx-auto my-10"
            />

            <Text className="text-dark text-fluid-xxs leading-[24px]">
              Dear {name},
            </Text>

            <Text className="text-dark text-fluid-xxs leading-[24px]">
              Welcome! You've been personally invited to join{" "}
              <strong>Omenai</strong>, and we couldn't be more excited to have
              you become part of our community.
            </Text>

            <Text className="text-dark text-fluid-xxs text-center leading-[24px]">
              To activate your account, use this unique code:{" "}
              <strong>{inviteCode}</strong>
            </Text>

            <Text className="m-0 text-fluid-xxs font-semibold leading-[32px] text-gray-900">
              Getting Started is Easy! Follow these simple steps to join us:
            </Text>

            <ul>
              <li>
                <Text className="text-dark text-fluid-xxs leading-[24px]">
                  Click on the button below
                </Text>
              </li>
              <li>
                <Text className="m-0 text-fluid-xxs leading-[28px] text-gray-900">
                  Enter your invite code and provide your email address
                </Text>
              </li>
              <li>
                <Text className="m-0 text-fluid-xxs leading-[28px] text-gray-900">
                  Complete registration and onboarding and Start exploring!
                </Text>
              </li>
            </ul>

            {entity === "artist" ? (
              <Text className="text-fluid-xxs leading-[24px]">
                We look forward to seeing your beautiful creations!
              </Text>
            ) : (
              <Text className="text-fluid-xxs leading-[24px]">
                We eagerly anticipate working alongside your gallery!
              </Text>
            )}

            <div style={{ textAlign: "center", margin: "30px 0" }}>
              <Link
                href={`${auth_uri()}/waitlist/invite?entity=${entity}&email=${encodeURIComponent(email)}&inviteCode=${inviteCode}`}
                style={{
                  display: "inline-block",
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "16px",
                }}
              >
                Join Omenai
              </Link>
            </div>

            <br />
            <Text className="text-fluid-xxs leading-[24px]">
              Best regards, <br /> The Omenai team
            </Text>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-dark text-[12px] leading-[24px]">
              Please be advised that the information contained within this email
              was directed exclusively to{" "}
              <span className="text-dark">{email} </span>. In the event that you
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

export default InvitationEmail;
