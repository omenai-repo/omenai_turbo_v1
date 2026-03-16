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
} from "@react-email/components";
import * as React from "react";
import { COMPANY_INFO } from "../../constants/constants";
import EmailFooter from "../../components/Footer";
import EmailArtworkCard from "../components/EmailArtworkCard";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";

interface OrderRequestReceivedEmailProps {
  name: string;
  artwork: Pick<
    ArtworkSchemaTypes,
    "title" | "artist" | "art_id" | "pricing" | "url"
  >;
  orderId: string;
}

export const OrderRequestReceivedEmail = ({
  name,
  artwork,
  orderId,
}: OrderRequestReceivedEmailProps) => {
  const artworkUrl = `${base_url()}/artwork/${artwork.url}`;
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
              .bg-box { background-color: #111827 !important; border-color: #374151 !important; }
              .border-divider { border-color: #374151 !important; }
              .link-main { color: #60a5fa !important; }
            }
          `}
        </style>
      </Head>
      <Preview>We’ve received your request</Preview>
      <Tailwind>
        <Body
          className="body-bg bg-gray-50 font-sans"
          style={{ margin: "0", padding: "0" }}
        >
          <Container
            className="container-bg bg-white rounded -lg shadow-sm border border-gray-200 overflow-hidden"
            style={{ maxWidth: "560px", margin: "40px auto", padding: "24px" }}
          >
            <Text className="text-main text-gray-800" style={textStyle}>
              Hello <strong>{name}</strong>,
            </Text>

            <Text className="text-main text-gray-800" style={textStyle}>
              Thank you for your interest in{" "}
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
              We&apos;ve received your request, and our advisory team is
              preparing your quote.
            </Text>

            <EmailArtworkCard
              artwork={artwork.title}
              artistName={artwork.artist}
              price={`$${artwork.pricing.usd_price.toLocaleString()}`}
              artworkImage={optimizedImage}
            />

            <Text
              className="text-main text-gray-900"
              style={{ ...textStyle, fontWeight: "600", marginTop: "32px" }}
            >
              What happens next:
            </Text>

            {/* Steps Section */}
            <Section className="mb-8">
              <div className="bg-box bg-gray-50 border border-gray-100 border-divider rounded -md p-4 mb-3">
                <Text
                  className="text-muted text-gray-600 m-0"
                  style={{ fontSize: "13px", lineHeight: "1.5" }}
                >
                  1. We&apos;ll confirm delivery and insurance to your location
                </Text>
              </div>

              <div className="bg-box bg-gray-50 border border-gray-100 border-divider rounded -md p-4 mb-3">
                <Text
                  className="text-muted text-gray-600 m-0"
                  style={{ fontSize: "13px", lineHeight: "1.5" }}
                >
                  2. We&apos;ll calculate any applicable taxes and fees
                </Text>
              </div>

              <div className="bg-box bg-gray-50 border border-gray-100 border-divider rounded -md p-4">
                <Text
                  className="text-muted text-gray-600 m-0"
                  style={{ fontSize: "13px", lineHeight: "1.5" }}
                >
                  3. We&apos;ll send a detailed quote within 1-2 business days
                </Text>
              </div>
            </Section>

            <Section className="bg-box bg-gray-50 p-4 rounded -md border border-gray-100 border-divider mb-8">
              <Text
                className="text-muted text-gray-500 m-0"
                style={{ fontSize: "12px", textAlign: "center" }}
              >
                Order Reference:{" "}
                <strong className="text-main text-gray-800">{orderId}</strong>
              </Text>
            </Section>

            <Text className="text-main text-gray-800" style={textStyle}>
              Once your quote is ready, we’ll share a full cost breakdown and
              the next steps to complete your purchase.
            </Text>
            <Text className="text-main text-gray-800" style={textStyle}>
              If you have any timing, delivery, or documentation requirements,
              reply to this email and we’ll take care of it.
            </Text>
            <Text className="text-main text-gray-800" style={textStyle}>
              We appreciate your patience and look forward to helping you place
              this work in your collection.
            </Text>

            <Text
              className="text-main text-gray-800"
              style={{ ...textStyle, marginTop: "32px" }}
            >
              Warmly,
              <br />
              <strong
                className="heading-main text-gray-900"
                style={{ fontWeight: "600" }}
              >
                Omenai Advisory
              </strong>
              <br />
            </Text>

            <Hr
              className="border-divider border-gray-200"
              style={{ margin: "32px 0" }}
            />

            <Text>
              Questions about this work? Connect with our advisory team for
              details, provenance, and documentation at{" "}
              <Link
                className="link-main italic"
                style={{
                  color: "#2563eb",
                  textDecoration: "none",
                  fontWeight: "500",
                }}
                href="mailto:support@omenai.app"
              >
                support@omenai.app
              </Link>
            </Text>

            <EmailFooter recipientName={name} showSupportSection={true} />
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

export default OrderRequestReceivedEmail;
