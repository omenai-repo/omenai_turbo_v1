import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Heading,
  Hr,
  Img,
  Link,
  Tailwind,
  Section,
} from "@react-email/components";
import * as React from "react";

interface SubscriptionPaymentPendingEmailProps {
  name: string;
  email?: string;
}

export const SubscriptionPaymentPendingEmail = ({
  name,
}: SubscriptionPaymentPendingEmailProps) => {
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
              .bg-box { background-color: #1f2937 !important; border-color: #374151 !important; }
              .border-divider { border-color: #374151 !important; }
              .link-main { color: #60a5fa !important; }
            }
          `}
        </style>
      </Head>
      <Preview>
        Update: Your Omenai subscription payment is currently being securely
        processed.
      </Preview>
      <Tailwind>
        <Body
          className="body-bg bg-gray-50 font-sans"
          style={{ margin: "0", padding: "0" }}
        >
          <Container
            className="container-bg bg-white rounded -lg shadow-sm border border-gray-200 overflow-hidden"
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
              Payment Processing
            </Heading>

            <Text className="text-main text-gray-800" style={textStyle}>
              Hello <strong>{name}</strong>,
            </Text>

            <Text className="text-main text-gray-800" style={textStyle}>
              Thank you for initiating your subscription payment. Your
              transaction has been securely received and is currently undergoing
              standard verification by our payment gateway.
            </Text>

            <Text className="text-main text-gray-800" style={textStyle}>
              This process typically completes within a few minutes, though
              depending on your banking provider, it may occasionally require up
              to 24 hours to fully clear.
            </Text>

            {/* Status & Next Steps Box */}
            <Section
              className="bg-box"
              style={{
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                padding: "20px",
                margin: "24px 0",
                border: "1px solid #e5e7eb",
              }}
            >
              <Text
                className="heading-main text-gray-900"
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "15px",
                  fontWeight: "600",
                }}
              >
                What to expect next:
              </Text>
              <Text className="text-muted text-gray-600" style={listItemStyle}>
                • We are actively monitoring your transaction status.
              </Text>
              <Text className="text-muted text-gray-600" style={listItemStyle}>
                • You will receive a definitive confirmation email the moment
                the payment clears.
              </Text>
              <Text
                className="text-muted text-gray-600"
                style={{ ...listItemStyle, margin: "0" }}
              >
                • Your gallery's subscription will be instantly activated upon
                confirmation.
              </Text>
            </Section>

            <Text className="text-main text-gray-800" style={textStyle}>
              If you do not receive a confirmation email within 24 hours, or if
              you have any questions regarding this charge, our team is ready to
              assist you at{" "}
              <Link
                href="mailto:support@omenai.app"
                className="link-main"
                style={{
                  color: "#2563eb",
                  textDecoration: "none",
                  fontWeight: "500",
                }}
              >
                support@omenai.app
              </Link>
              .
            </Text>

            <Text
              className="text-main text-gray-800"
              style={{ ...textStyle, marginTop: "32px" }}
            >
              Thank you for your patience and for choosing Omenai.
              <br />
              <br />
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
              immediately. Unauthorized use or distribution is strictly
              prohibited.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

// Shared text styles
const textStyle = {
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

const listItemStyle = {
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0 0 8px 0",
};

export default SubscriptionPaymentPendingEmail;
