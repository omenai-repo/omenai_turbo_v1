import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
  Heading,
  Hr,
} from "@react-email/components";
import * as React from "react";
import EmailFooter from "../../components/Footer";
import { COMPANY_INFO } from "../../constants/constants";
import { dashboard_url } from "@omenai/url-config/src/config";

interface OrderDeclinedWarningEmailProps {
  name: string;
  email?: string;
}

export const OrderDeclinedWarningEmail = ({
  name,
}: OrderDeclinedWarningEmailProps) => {
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
              .advisory-box { background-color: #1f2937 !important; border-left-color: #fbbf24 !important; }
            }
          `}
        </style>
      </Head>
      <Preview>
        Action Required: Your pending orders will expire in 24 hours.
      </Preview>
      <Tailwind>
        <Body
          className="body-bg bg-gray-50 font-sans"
          style={{ margin: "0", padding: "0" }}
        >
          <Container
            className="container-bg bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            style={{ maxWidth: "560px", margin: "40px auto", padding: "24px" }}
          >
            <Heading
              className="heading-main text-gray-900"
              style={{
                fontSize: "22px",
                fontWeight: "600",
                letterSpacing: "-0.5px",
                margin: "0 0 24px 0",
              }}
            >
              Action Required: Pending Sales Advisory
            </Heading>

            <Text className="text-main text-gray-800" style={textStyle}>
              Hello <strong>{name}</strong>,
            </Text>

            <Text className="text-main text-gray-800" style={textStyle}>
              Our records indicate that you have pending order requests that
              require your immediate attention. To maintain a responsive
              experience for our collectors, these requests will automatically
              expire if not addressed within the next <strong>24 hours</strong>.
            </Text>

            {/* Advisory Box */}
            <Section
              className="advisory-box bg-amber-50"
              style={{
                borderRadius: "0 8px 8px 0",
                padding: "24px",
                margin: "32px 0",
                border: "1px solid #fde68a",
                borderLeft: "4px solid #f59e0b",
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
                Important Deadlines:
              </Text>
              <Text className="text-main text-gray-800" style={listItemStyle}>
                • Orders expire exactly 24 hours from this notification.
              </Text>
              <Text className="text-main text-gray-800" style={listItemStyle}>
                • Expired requests are automatically declined and the collector
                is notified.
              </Text>
              <Text
                className="text-main text-gray-800"
                style={{ ...listItemStyle, margin: "0" }}
              >
                • Unresolved requests may impact your gallery's placement on the
                platform.
              </Text>
            </Section>

            {/* Restored CTA */}
            <Section style={{ textAlign: "center", margin: "32px 0" }}>
              <Button
                href={`${dashboard_url()}/gallery/orders`}
                className="btn-main"
                style={{
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: "500",
                  padding: "16px 36px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  display: "inline-block",
                  letterSpacing: "0.3px",
                }}
              >
                Review Pending Orders
              </Button>
            </Section>

            <Text className="text-main text-gray-800" style={textStyle}>
              Promptly responding to inquiries is the most effective way to
              secure sales and build trust with the global Omenai community.
            </Text>

            <Text
              className="text-main text-gray-800"
              style={{ ...textStyle, marginTop: "32px" }}
            >
              Warm regards,
              <br />
              <span
                className="text-muted text-gray-500"
                style={{ fontSize: "14px" }}
              >
                Omenai Advisory, {COMPANY_INFO.name}
              </span>
            </Text>

            <Hr
              className="border-divider border-gray-200"
              style={{ margin: "32px 0" }}
            />

            <EmailFooter
              recipientName={name}
              showSupportSection={true}
              supportTitle="Need assistance?"
              supportMessage="If you are experiencing issues managing your orders, please reach out at"
            />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

// Shared styles
const textStyle = {
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

const listItemStyle = {
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 10px 0",
};

export default OrderDeclinedWarningEmail;
