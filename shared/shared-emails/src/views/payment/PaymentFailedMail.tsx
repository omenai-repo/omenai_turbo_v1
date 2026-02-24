import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Img,
  Link,
  Tailwind,
  Button,
} from "@react-email/components";
import * as React from "react";
import EmailFooter from "../../components/Footer";
import EmailArtworkCard from "../components/EmailArtworkCard";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";
import { COMPANY_INFO } from "../../constants/constants";

interface PaymentFailedEmailProps {
  buyerName: string;
  artwork: string;
}

export const PaymentFailedEmail = ({
  buyerName,
  artwork,
}: PaymentFailedEmailProps) => {
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
              .advisory-box { background-color: #1f2937 !important; border-left-color: #ef4444 !important; }
            }
          `}
        </style>
      </Head>
      <Preview>
        Update: There was an issue processing your transaction for {artwork}.
      </Preview>
      <Tailwind>
        <Body
          className="body-bg bg-gray-50 font-sans"
          style={{ margin: "0", padding: "0" }}
        >
          <Container
            className="container-bg bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            style={{ maxWidth: "600px", margin: "40px auto", padding: "24px" }}
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
              Issue processing your transaction
            </Heading>

            <Text className="text-main text-gray-800" style={textStyle}>
              Hello <strong>{buyerName}</strong>,
            </Text>

            <Text className="text-main text-gray-800" style={textStyle}>
              We attempted to process the payment for your recent artwork
              purchase, but the transaction could not be completed at this time.
            </Text>

            {/* Support/Reason Box */}
            <Section className="advisory-box bg-red-50 rounded-r-lg p-5 border-l-4 border-red-500 my-8">
              <Text
                className="text-main text-gray-800 m-0"
                style={{ fontSize: "14px", lineHeight: "1.6" }}
              >
                <strong
                  className="heading-main text-gray-900"
                  style={{ fontWeight: "600" }}
                >
                  Recommendation:
                </strong>{" "}
                We suggest verifying your billing details or contacting your
                financial institution to ensure the transaction is permitted.
              </Text>
            </Section>

            <Text className="text-main text-gray-800" style={textStyle}>
              Our advisory team is standing by to assist you. If you have
              questions about the transaction or require a different payment
              method, please reply directly to this email or reach out to us at{" "}
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
              Warmly,
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

            <EmailFooter recipientName={buyerName} showSupportSection={false} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

const textStyle = {
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

export default PaymentFailedEmail;
