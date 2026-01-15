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
import EmailFooter from "../../components/Footer";

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
          <Section>
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
              Thanks for joining the waitlist We're excited to have you here.
              Right now, we're testing with a limited group to make sure
              everything works as it should. Once we're ready to expand, you'll
              be first in line for an invite. We'll keep you posted along the
              way with updates on our progress and let you know as soon as we're
              ready to bring you in.
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
            <EmailFooter recipientName={email} />
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
