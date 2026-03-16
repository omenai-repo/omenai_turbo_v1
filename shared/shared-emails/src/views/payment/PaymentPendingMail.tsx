import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";
import EmailFooter from "../../components/Footer";
import EmailArtworkCard from "../components/EmailArtworkCard";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";
import { COMPANY_INFO } from "../../constants/constants";

interface PaymentPendingMailProps {
  buyerName: string;
  artwork: string;
}

export const PaymentPendingMail = ({
  buyerName,
  artwork,
}: PaymentPendingMailProps) => {
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
        Update: Your payment for {artwork} is securely processing.
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
            <Heading
              className="heading-main text-gray-900"
              style={{
                fontSize: "22px",
                fontWeight: "600",
                letterSpacing: "-0.5px",
                margin: "0 0 24px 0",
              }}
            >
              Transaction Processing
            </Heading>

            <Text className="text-main text-gray-800" style={textStyle}>
              Hello <strong>{buyerName}</strong>,
            </Text>

            <Text className="text-main text-gray-800" style={textStyle}>
              Thank you for initiating the checkout process. We are writing to
              let you know that your payment is currently undergoing standard
              security verification by our payment gateway.
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
                What happens next:
              </Text>
              <Text className="text-muted text-gray-600" style={listItemStyle}>
                • This verification typically takes only a few moments, but can
                occasionally take up to 24 hours depending on your financial
                institution.
              </Text>
              <Text className="text-muted text-gray-600" style={listItemStyle}>
                • You will receive a final, official receipt via email the
                moment the funds clear.
              </Text>
              <Text
                className="text-muted text-gray-600"
                style={{ ...listItemStyle, margin: "0" }}
              >
                • Upon clearance, we&apos;ll begin preparing your piece for
                shipment.
              </Text>
            </Section>

            <Text className="text-main text-gray-800" style={textStyle}>
              Your account security is our top priority. If you have any
              questions or concerns regarding this transaction, please reach out
              to our client advisory team at{" "}
              <Link
                href={`mailto:${COMPANY_INFO.email}`}
                className="link-main"
                style={{
                  color: "#2563eb",
                  textDecoration: "none",
                  fontWeight: "500",
                }}
              >
                {COMPANY_INFO.email}
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

// Shared text styles
const textStyle = {
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

const listItemStyle = {
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0 0 10px 0",
};

export default PaymentPendingMail;
