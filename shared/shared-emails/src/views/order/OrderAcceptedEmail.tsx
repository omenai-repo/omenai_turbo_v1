import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { base_url } from "@omenai/url-config/src/config";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Tailwind,
  Section,
  Img,
  Text,
  Link,
  Preview,
  Button,
} from "@react-email/components";
import * as React from "react";
import { COMPANY_INFO } from "../../constants/constants";
import EmailFooter from "../../components/Footer";
import EmailArtworkCard from "../components/EmailArtworkCard";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";

interface OrderAcceptedEmailProps {
  name: string;
  orderId: string;
  userId: string;
  artwork: Pick<
    ArtworkSchemaTypes,
    "title" | "artist" | "art_id" | "pricing" | "url"
  >;
  email?: string;
}

export const OrderAcceptedEmail = ({
  name,
  orderId,
  userId,
  artwork,
}: OrderAcceptedEmailProps) => {
  const baseUrl = base_url();
  const paymentUrl = `${baseUrl}/payment/${orderId}?id_key=${userId}`;
  const artworkUrl = `${baseUrl}/artwork/${artwork.title}`;
  const optimizedImage = getImageFileView(artwork.url, 400);

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
              .urgency-box { background-color: #1f2937 !important; border-color: #374151 !important; border-left-color: #fbbf24 !important; }
            }
          `}
        </style>
      </Head>
      <Preview>
        Action Required: Your order request for {artwork.title} has been
        approved. Complete your purchase now.
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
              Your order request is approved.
            </Heading>

            <Text className="text-main text-gray-800" style={textStyle}>
              Hello <strong>{name}</strong>,
            </Text>

            <Text className="text-main text-gray-800" style={textStyle}>
              We are delighted to share that your offer for{" "}
              <Link
                href={artworkUrl}
                className="link-main"
                style={{
                  color: "#2563eb",
                  textDecoration: "none",
                  fontWeight: "500",
                }}
              >
                {artwork.title}
              </Link>{" "}
              has been officially accepted by the gallery, and all shipping
              logistics have been calculated.
            </Text>

            <EmailArtworkCard
              artwork={artwork.title}
              artworkImage={optimizedImage}
              artistName={artwork.artist}
              price={`$${artwork.pricing.price.toLocaleString()}`}
            />

            {/* High-Visibility Urgency Box - Updated for "No-Hold" Policy */}
            <Section
              className="urgency-box bg-amber-50"
              style={{
                borderRadius: "0 8px 8px 0",
                padding: "20px",
                margin: "32px 0",
                border: "1px solid #fde68a",
                borderLeft: "4px solid #f59e0b",
              }}
            >
              <Text
                className="heading-main text-gray-900"
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "15px",
                  fontWeight: "600",
                }}
              >
                24-Hour Payment Window
              </Text>
              <Text
                className="text-main text-gray-800"
                style={{ margin: "0", fontSize: "14px", lineHeight: "1.6" }}
              >
                Please note that an accepted offer does not reserve the artwork.
                You have a strict <strong>24-hour window</strong> to complete
                your transaction. Until payment is finalized, the piece remains
                available on the open market and can be acquired by other
                collectors.
              </Text>
            </Section>

            <Section style={{ textAlign: "center", margin: "32px 0" }}>
              <Button
                href={paymentUrl}
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
                Secure Your Acquisition
              </Button>
            </Section>

            <Text className="text-main text-gray-800" style={textStyle}>
              If you require assistance with the checkout process or have
              specific questions about delivery, please reply directly to this
              email or reach out to our advisory team at{" "}
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
              Thank you for trusting Omenai to connect you with exceptional art.
              <br />
              <br />
              Warm regards,
              <br />
              <span
                className="text-muted text-gray-500"
                style={{ fontSize: "14px" }}
              >
                Client Advisory, {COMPANY_INFO.name}
              </span>
            </Text>

            <Hr
              className="border-divider border-gray-200"
              style={{ margin: "32px 0" }}
            />

            <EmailFooter recipientName={name} showSupportSection={false} />
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

export default OrderAcceptedEmail;
