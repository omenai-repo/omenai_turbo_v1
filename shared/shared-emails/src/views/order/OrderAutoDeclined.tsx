import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { base_url, dashboard_url } from "@omenai/url-config/src/config";
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

interface OrderAutoDeclinedEmailProps {
  name: string;
  artwork: Pick<
    ArtworkSchemaTypes,
    "title" | "artist" | "art_id" | "pricing" | "url"
  >;
  email?: string;
}

export const OrderAutoDeclinedEmail = ({
  name,
  artwork,
}: OrderAutoDeclinedEmailProps) => {
  const baseUrl = base_url();
  const artworkUrl = `${baseUrl}/artwork/${artwork.url}`;
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
            }
          `}
        </style>
      </Head>
      <Preview>
        Update: The Order Request for {artwork.title} has expired.
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
              Order Request Expired
            </Heading>

            <Text className="text-main text-gray-800" style={textStyle}>
              Hello <strong>{name}</strong>,
            </Text>

            <Text className="text-main text-gray-800" style={textStyle}>
              We are writing to inform you that the pending order request for{" "}
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
              has automatically expired.
            </Text>

            <Text className="text-main text-gray-800" style={textStyle}>
              To maintain a highly responsive, premium experience for Omenai
              collectors, all acquisition requests require approval within a
              designated timeframe. As we did not receive a response, the
              request has been closed and the collector has been notified.
            </Text>

            <EmailArtworkCard
              artwork={artwork.title}
              artworkImage={optimizedImage}
              artistName={artwork.artist}
              price={`$${artwork.pricing.usd_price.toLocaleString()}`}
            />

            <Text
              className="text-main text-gray-800"
              style={{ ...textStyle, marginTop: "24px" }}
            >
              We understand that managing gallery inventory and multiple
              inquiries can be demanding. Your piece remains safely listed on
              the platform and is available for future offers.
            </Text>

            {/* Dashboard Redirect */}
            <Section style={{ textAlign: "center", margin: "32px 0" }}>
              <Button
                href={`${dashboard_url()}/gallery/dashboard`}
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
                Review Dashboard Actions
              </Button>
            </Section>

            <Text className="text-main text-gray-800" style={textStyle}>
              If you experienced technical difficulties receiving the initial
              notification, please reach out to us at{" "}
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
              Warm regards,
              <br />
              <strong
                className="heading-main text-gray-900"
                style={{ fontWeight: "600" }}
              >
                The Omenai Team
              </strong>
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

export default OrderAutoDeclinedEmail;
