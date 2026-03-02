import { dashboard_url } from "@omenai/url-config/src/config";
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
  Section,
  Preview,
} from "@react-email/components";
import * as React from "react";

interface SubscriptionPaymentFailedMailProps {
  name: string;
  email?: string;
}

export const SubscriptionPaymentFailedMail = ({
  name,
}: SubscriptionPaymentFailedMailProps) => {
  return (
    <Html>
      <Head>
        <style>
          {`
            @media (prefers-color-scheme: dark) {
              .body-bg { background-color: #0f172a !important; }
              .container-bg { background-color: #000000 !important; border: 1px solid #1f2937 !important; }
              .text-main { color: #e5e7eb !important; }
              .text-muted { color: #9ca3af !important; }
              .heading-main { color: #ffffff !important; }
              .btn-main { background-color: #ffffff !important; color: #000000 !important; }
              .border-divider { border-color: #374151 !important; }
              .link-main { color: #60a5fa !important; }
            }
          `}
        </style>
      </Head>
      <Preview>
        Action Required: Please update your payment information to maintain your
        subscription.
      </Preview>
      <Tailwind>
        <Body
          className="body-bg bg-gray-50 font-sans"
          style={{ margin: "0", padding: "0" }}
        >
          <Container
            className="container-bg bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            style={{ maxWidth: "560px", margin: "40px auto", padding: "32px" }}
          >
            {/* Centered Brand Anchor */}
            <Section style={{ textAlign: "center", marginBottom: "32px" }}>
              <Img
                src="https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/696ee3b60025e2a2c4ff/view?project=682272b1001e9d1609a8"
                width="120"
                height="auto"
                alt="Omenai logo"
                style={{ margin: "0 auto" }}
              />
            </Section>

            <Heading
              className="heading-main text-gray-900"
              style={{
                fontSize: "20px",
                fontWeight: "600",
                letterSpacing: "-0.5px",
                margin: "0 0 24px 0",
              }}
            >
              Action Required: Subscription Payment Unsuccessful
            </Heading>

            <Text className="text-main text-gray-800" style={textStyle}>
              Hello <strong>{name}</strong>,
            </Text>

            <Text className="text-main text-gray-800" style={textStyle}>
              We are reaching out to inform you that we were unable to process
              the recent payment for your Omenai subscription.
            </Text>

            <Text className="text-main text-gray-800" style={textStyle}>
              To prevent any interruption in your gallery's access to the
              platform, please take a moment to update your billing information.
              Your account data remains completely secure, but active
              subscription features are temporarily paused until the balance is
              resolved.
            </Text>

            <Section style={{ margin: "32px 0" }}>
              <Button
                href={`${dashboard_url()}/gallery/billing/card`}
                className="btn-main"
                style={{
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: "500",
                  padding: "14px 28px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  display: "inline-block",
                  letterSpacing: "0.3px",
                }}
              >
                Update Payment Details
              </Button>
            </Section>

            <Text className="text-main text-gray-800" style={textStyle}>
              If you require any assistance navigating this or have questions
              regarding your account, please reply directly to this email or
              reach out to our team at{" "}
              <Link
                href="mailto:info@omenai.app"
                className="link-main"
                style={{
                  color: "#2563eb",
                  textDecoration: "none",
                  fontWeight: "500",
                }}
              >
                info@omenai.app
              </Link>
              .
            </Text>

            <Text
              className="text-main text-gray-800"
              style={{ ...textStyle, marginTop: "32px" }}
            >
              Warm regards,
              <br />
              <br />
              <strong
                className="heading-main text-gray-900"
                style={{ fontWeight: "600" }}
              >
                Moses
              </strong>
              <br />
              <span
                className="text-muted text-gray-500"
                style={{ fontSize: "14px" }}
              >
                The Omenai Team
              </span>
            </Text>

            <Hr
              className="border-divider border-gray-200"
              style={{ margin: "32px 0" }}
            />

            {/* Muted Legal Footer */}
            <Text
              className="text-muted text-gray-500"
              style={{ fontSize: "12px", lineHeight: "1.6", margin: "0" }}
            >
              Please note: this communication is intended solely for{" "}
              <strong className="text-main text-gray-700">{name}</strong>. If
              you received this in error, please delete it and notify us
              immediately. This message may contain confidential information.
              Unauthorized use or distribution is strictly prohibited.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

// Shared text style
const textStyle = {
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

export default SubscriptionPaymentFailedMail;
