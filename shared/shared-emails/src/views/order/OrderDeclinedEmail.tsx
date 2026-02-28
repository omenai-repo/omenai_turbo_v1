import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { base_url } from "@omenai/url-config/src/config";
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
  Hr,
  Heading,
} from "@react-email/components";
import { COMPANY_INFO } from "../../constants/constants";
import * as React from "react";
import EmailFooter from "../../components/Footer";
import EmailArtworkCard from "../components/EmailArtworkCard";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";

interface OrderDeclinedEmailProps {
  recipientName: string;
  declineReason: string;
  artwork: Pick<
    ArtworkSchemaTypes,
    "title" | "artist" | "art_id" | "pricing" | "url"
  >;
  email?: string;
}

const OrderDeclinedEmail = ({
  recipientName,
  declineReason,
  artwork,
}: OrderDeclinedEmailProps) => {
  const baseUrl = base_url();
  const artworkUrl = `${baseUrl}/artwork/${artwork.url}`;
  const catalogUrl = `${baseUrl}/catalog`;
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
              .btn-secondary { background-color: transparent !important; color: #ffffff !important; border: 1px solid #ffffff !important; }
              .border-divider { border-color: #374151 !important; }
              .link-main { color: #60a5fa !important; }
              .note-box { background-color: #1f2937 !important; border-left-color: #4b5563 !important; }
            }
          `}
        </style>
      </Head>
      <Preview>
        Update regarding your acquisition request for {artwork.title}.
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
              Update on your acquisition request
            </Heading>

            <Text className="text-main text-gray-800" style={textStyle}>
              Hello <strong>{recipientName}</strong>,
            </Text>

            <Text className="text-main text-gray-800" style={textStyle}>
              Thank you for your interest in acquiring{" "}
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
              </Link>
              . We are writing to inform you that the gallery is unable to
              proceed with your current request at this time.
            </Text>

            {/* Generalized Note Section */}
            <Section
              className="note-box bg-gray-50"
              style={{
                margin: "24px 0",
                padding: "20px",
                borderLeft: "4px solid #e5e7eb",
                borderRadius: "0 8px 8px 0",
              }}
            >
              <Text
                className="text-muted text-gray-500"
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "12px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Gallery Update
              </Text>
              <Text
                className="text-main text-gray-800"
                style={{ margin: "0", fontSize: "15px", lineHeight: "1.6" }}
              >
                {declineReason ||
                  "The gallery is currently unable to fulfill this request due to scheduling or availability constraints."}
              </Text>
            </Section>

            <EmailArtworkCard
              artwork={artwork.title}
              artworkImage={optimizedImage}
              artistName={artwork.artist}
              price={`$${artwork.pricing.usd_price.toLocaleString()}`}
            />

            <Text
              className="text-main text-gray-800"
              style={{ ...textStyle, marginTop: "32px" }}
            >
              While this specific request could not be fulfilled, we would be
              pleased to help you submit a revised offer or explore alternative
              works from our curated collection.
            </Text>

            {/* Dual CTA Section */}
            <Section style={{ textAlign: "center", margin: "32px 0" }}>
              <Button
                href={artworkUrl}
                className="btn-main"
                style={{
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: "500",
                  padding: "14px 24px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  display: "inline-block",
                  marginRight: "12px",
                }}
              >
                View Piece Details
              </Button>
              <Button
                href={catalogUrl}
                className="btn-secondary"
                style={{
                  backgroundColor: "transparent",
                  color: "#111827",
                  border: "1px solid #111827",
                  fontSize: "14px",
                  fontWeight: "500",
                  padding: "14px 24px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Browse Collection
              </Button>
            </Section>

            <Hr
              className="border-divider border-gray-200"
              style={{ margin: "32px 0" }}
            />

            <Text
              className="text-muted text-gray-600"
              style={{ fontSize: "14px", lineHeight: "1.6" }}
            >
              Warmly,
              <br />
              <br />
              <strong className="heading-main text-gray-900">
                The Omenai Team
              </strong>
            </Text>

            <EmailFooter
              recipientName={recipientName}
              showSupportSection={false}
            />
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

export default OrderDeclinedEmail;
