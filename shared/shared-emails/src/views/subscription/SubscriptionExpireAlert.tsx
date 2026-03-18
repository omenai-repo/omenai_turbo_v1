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
  Tailwind,
  Section,
  Button,
} from "@react-email/components";
import * as React from "react";
import { dashboard_url } from "@omenai/url-config/src/config";

interface SubscriptionExpireAlertProps {
  name: string;
  day: string;
  email?: string;
}

export const SubscriptionExpireAlert = ({
  name,
  day,
}: SubscriptionExpireAlertProps) => {
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
              .btn-secondary { background-color: #1f2937 !important; color: #ffffff !important; border: 1px solid #374151 !important; }
              .border-divider { border-color: #374151 !important; }
            }
          `}
        </style>
      </Head>
      <Preview>
        Courtesy Reminder: Your Omenai subscription is scheduled to renew on{" "}
        {day}.
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
              Upcoming Subscription Renewal
            </Heading>

            <Text className="text-main text-gray-800" style={textStyle}>
              Hello <strong>{name}</strong>,
            </Text>

            <Text className="text-main text-gray-800" style={textStyle}>
              This is a courtesy reminder that your Omenai subscription is
              scheduled for its automated renewal on <strong>{day}</strong>.
            </Text>

            <Text className="text-main text-gray-800" style={textStyle}>
              We will process the payment using your default payment method on
              file. This ensures your gallery experiences zero interruptions and
              maintains seamless access to our platform's features.
            </Text>

            <Text className="text-main text-gray-800" style={textStyle}>
              If you need to update your card details prior to the billing date,
              you may easily do so through your gallery dashboard:
            </Text>

            <Section style={{ margin: "24px 0" }}>
              <Button
                href={`${dashboard_url()}/gallery/billing/card`}
                className="btn-secondary text-gray-700"
                style={{
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  fontSize: "14px",
                  fontWeight: "500",
                  padding: "12px 24px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Review Billing Settings
              </Button>
            </Section>

            <Text
              className="text-main text-gray-800"
              style={{ ...textStyle, marginTop: "32px" }}
            >
              Thank you for your continued partnership with Omenai.
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

// Shared text style
const textStyle = {
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

export default SubscriptionExpireAlert;
