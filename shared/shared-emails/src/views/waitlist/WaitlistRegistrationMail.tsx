import { base_url } from "@omenai/url-config/src/config";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import React from "react";

export default function WaitlistRegistrationMail(email: string) {
  return (
    <Html>
      <Head />
      <Preview>
        Thanks for joining our waitlist! We're excited to have you on board.
      </Preview>
      <Body
        style={{
          backgroundColor: "#ffffff",
          color: "#0f172a",
          fontFamily: "Helvetica, Arial, sans-serif",
          padding: "40px 20px",
        }}
      >
        <Container style={{ maxWidth: "600px", margin: "0 auto" }}>
          <Section
            style={{
              border: "1px solid #eee",
              borderRadius: "12px",
              padding: "32px",
            }}
          >
            <Heading
              as="h2"
              style={{
                color: "#0f172a",
                fontSize: "24px",
                marginBottom: "20px",
              }}
            >
              Thanks for joining our waitlist! We're excited to have you on
              board.
            </Heading>
            <Text
              style={{
                fontSize: "16px",
                lineHeight: "1.5",
                marginBottom: "16px",
              }}
            >
              Hi,
            </Text>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: "1.5",
                marginBottom: "16px",
              }}
            >
              We'll keep your spot reserved and send you an email as soon as
              we're ready to welcome you. In the meantime, you can expect
              updates about our progress and be among the first to know when we
              launch.
            </Text>

            <div style={{ textAlign: "center", margin: "30px 0" }}>
              <Link
                href={`${base_url()}`}
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
                Explore Omenai
              </Link>
            </div>

            <Text
              style={{ fontSize: "16px", lineHeight: "1.5", marginTop: "24px" }}
            >
              If you have any questions, feel free to contact our team, we'd
              love to hear from you.
            </Text>
            <Text style={{ marginTop: "40px", fontSize: "16px" }}>
              Best regards,
              <br />
              The <strong>Omenai</strong> Team
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-dark text-[12px] leading-[24px]">
              Please be advised that the information contained within this email
              was directed exclusively to{" "}
              <span className="text-black">{email} </span>. In the event that
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
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
