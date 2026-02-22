import {
  Heading,
  Text,
  Section,
  Container,
  Hr,
  Link,
} from "@react-email/components";
import React from "react";
import { dashboard_url } from "@omenai/url-config/src/config";
import ShipmentLayout from "./ShipmentLayout";
import EmailArtworkCard from "../components/EmailArtworkCard";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";

interface SendGalleryShipmentSuccessProps {
  name: string;
  trackingCode?: string;
  artwork: string;
  artworkImage: string;
  artistName: string;
  price: string;
}

export default function SendGalleryShipmentSuccess({
  name,
  trackingCode,
  artwork,
  artworkImage,
  artistName,
  price,
}: SendGalleryShipmentSuccessProps) {
  const optimizedImage = getImageFileView(artworkImage, 400);

  return (
    <ShipmentLayout
      preview={`Delivery confirmed: ${artwork} has been securely delivered.`}
      name={name}
    >
      {/* Dark Mode Overrides */}
      <style>
        {`
          @media (prefers-color-scheme: dark) {
            .text-main { color: #e5e7eb !important; }
            .text-muted { color: #9ca3af !important; }
            .heading-main { color: #ffffff !important; }
            .bg-box { background-color: #1f2937 !important; border-color: #374151 !important; }
            .btn-main { background-color: #ffffff !important; color: #000000 !important; }
          }
        `}
      </style>

      <Container style={{ maxWidth: "600px", margin: "0 auto" }}>
        <Section style={{ padding: "10px 0" }}>
          <Heading
            as="h2"
            className="heading-main"
            style={{
              color: "#111827",
              fontSize: "24px",
              fontWeight: "600",
              letterSpacing: "-0.5px",
              marginBottom: "24px",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Successful Placement Confirmed
          </Heading>

          <Text className="text-main" style={textStyle}>
            Hello {name},
          </Text>

          <Text className="text-main" style={textStyle}>
            We are pleased to inform you that the shipment for your recently
            sold artwork has been securely delivered and verified by the
            collector.
          </Text>

          {trackingCode && (
            <Section
              className="bg-box"
              style={{
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                padding: "16px",
                margin: "24px 0",
                border: "1px solid #e5e7eb",
              }}
            >
              <Text
                className="text-muted"
                style={{ ...textStyle, margin: "0", color: "#4b5563" }}
              >
                <strong className="heading-main" style={{ color: "#111827" }}>
                  Logistics Reference:
                </strong>{" "}
                {trackingCode}
              </Text>
            </Section>
          )}

          <EmailArtworkCard
            artwork={artwork}
            artworkImage={optimizedImage}
            artistName={artistName}
            price={price}
          />

          <Text
            className="text-main"
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              color: "#374151",
              marginTop: "32px",
              marginBottom: "24px",
            }}
          >
            The transaction is now officially marked as complete. You can review
            the full delivery details and access your settlement statements
            directly from your gallery dashboard.
          </Text>

          <Section style={{ textAlign: "center", margin: "32px 0" }}>
            <Link
              href={`${dashboard_url()}/gallery/orders`}
              className="btn-main"
              style={{
                display: "inline-block",
                backgroundColor: "#000000",
                color: "#ffffff",
                padding: "14px 28px",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "15px",
                fontWeight: "500",
                letterSpacing: "0.3px",
              }}
            >
              Go to Gallery Dashboard
            </Link>
          </Section>

          <Hr
            className="bg-box" /* Reusing bg-box to handle border color flip in dark mode */
            style={{
              borderColor: "#e5e7eb",
              margin: "32px 0",
            }}
          />

          <Text
            className="text-muted"
            style={{ ...textStyle, color: "#6b7280", fontSize: "14px" }}
          >
            Thank you for partnering with Omenai to deliver exceptional art
            experiences.
            <br />
            Warmly,
            <br />
            <strong className="heading-main" style={{ color: "#111827" }}>
              The Omenai Team
            </strong>
          </Text>
        </Section>
      </Container>
    </ShipmentLayout>
  );
}

// Shared text style for consistency
const textStyle = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#374151",
  marginBottom: "16px",
};
