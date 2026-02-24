import { Heading, Text, Section, Container, Hr } from "@react-email/components";
import React from "react";
import ShipmentLayout from "./ShipmentLayout";
import EmailArtworkCard from "../components/EmailArtworkCard";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";

interface SendBuyerShipmentSuccessProps {
  trackingCode: string;
  name: string;
  artwork: string;
  artworkImage: string;
  artistName: string;
  price: string;
  email?: string; // Added here to match your testing requirements
}

export default function SendBuyerShipmentSuccess({
  trackingCode,
  name,
  artwork,
  artworkImage,
  artistName,
  price,
}: SendBuyerShipmentSuccessProps) {
  const optimizedImage = getImageFileView(artworkImage, 400);

  return (
    <ShipmentLayout
      preview={`Your artwork has arrived: ${artwork} by ${artistName}.`}
      name={name}
    >
      <Container style={{ maxWidth: "600px", margin: "0 auto" }}>
        <Section style={{ padding: "10px 0" }}>
          <Heading
            as="h2"
            style={{
              color: "#111827",
              fontSize: "24px",
              fontWeight: "600",
              letterSpacing: "-0.5px",
              marginBottom: "24px",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Your masterpiece has arrived.
          </Heading>

          <Text style={textStyle}>Dear {name},</Text>

          <Text style={textStyle}>
            We are delighted to confirm that your newly acquired artwork has
            been successfully delivered. It is always a momentous occasion when
            a piece finds its final home.
          </Text>

          {/* Stylized Order Reference Box */}
          <Section
            style={{
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              padding: "16px",
              margin: "24px 0",
              border: "1px solid #e5e7eb",
            }}
          >
            <Text style={{ ...textStyle, margin: "0", color: "#4b5563" }}>
              <strong style={{ color: "#111827" }}>
                Order & Tracking Reference:
              </strong>{" "}
              {trackingCode}
            </Text>
          </Section>

          <EmailArtworkCard
            artwork={artwork}
            artworkImage={optimizedImage}
            artistName={artistName}
            price={price}
          />

          <Text
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              color: "#374151",
              marginTop: "32px",
              marginBottom: "24px",
            }}
          >
            We hope this piece brings immense inspiration to your space. If you
            require any assistance with unboxing, installation advice, or have
            any questions about your acquisition, our dedicated advisory team is
            here to help.
          </Text>

          <Hr
            style={{
              borderColor: "#e5e7eb",
              margin: "32px 0",
            }}
          />

          <Text style={{ ...textStyle, color: "#6b7280", fontSize: "14px" }}>
            Thank you for collecting with Omenai.
            <br />
            Warmly,
            <br />
            <strong style={{ color: "#111827" }}>The Omenai Team</strong>
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
