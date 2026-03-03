import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import {
  Img,
  Section,
  Text,
  Container,
  Row,
  Column,
  Hr,
} from "@react-email/components";
import React from "react";

interface EmailArtworkCardProps {
  artwork: string;
  artworkImage: string;
  artistName: string;
  price: string;
}

export default function EmailArtworkCard({
  artwork,
  artworkImage,
  artistName,
  price,
}: EmailArtworkCardProps) {
  return (
    <Container className="card-container" style={card}>
      {/* Self-contained Dark Mode for the Card */}
      <style>
        {`
          @media (prefers-color-scheme: dark) {
            .card-container { background-color: #111827 !important; border-color: #374151 !important; box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important; }
            .image-bg { background-color: #1f2937 !important; }
            .text-title { color: #ffffff !important; }
            .text-subtitle { color: #9ca3af !important; }
            .divider-line { border-color: #374151 !important; }
            .text-value { color: #f3f4f6 !important; }
          }
        `}
      </style>

      {/* Image Section (The "Matting") */}
      <Section className="image-bg" style={imageWrapper}>
        <Img src={artworkImage} alt={artwork} width={320} style={image} />
      </Section>

      {/* Details Section */}
      <Section style={detailsWrapper}>
        <Text className="text-title" style={artworkTitle}>
          {artwork}
        </Text>
        <Text className="text-subtitle" style={artistText}>
          {artistName}
        </Text>

        <Hr className="divider-line" style={divider} />

        {/* Bulletproof Table-Based Row for Value */}
        <Row>
          <Column align="left">
            <Text className="text-subtitle" style={label}>
              Artwork Value
            </Text>
          </Column>
          <Column align="right">
            <Text className="text-value" style={priceText}>
              {price}
            </Text>
          </Column>
        </Row>
      </Section>
    </Container>
  );
}

// --- Styles ---

const card = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px", // Tightened from 12px for a sharper, more editorial look
  overflow: "hidden",
  maxWidth: "380px", // Slightly wider to let the image breathe
  margin: "32px auto",
  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
};

const imageWrapper = {
  backgroundColor: "#f9fafb",
  padding: "32px 24px", // Increased padding to create a better gallery framing effect
  textAlign: "center" as const,
};

const image = {
  display: "inline-block",
  maxWidth: "100%",
  width: "320px",
  height: "auto",
  margin: "0 auto",
  borderRadius: "2px", // Barely-there radius so it doesn't look like an app icon
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)", // Stronger shadow so the canvas pops off the matting
  imageRendering: "-webkit-optimize-contrast" as const,
};

const detailsWrapper = {
  padding: "24px",
};

const artworkTitle = {
  margin: "0 0 6px 0",
  fontSize: "20px",
  fontWeight: "600",
  color: "#111827",
  fontFamily: "Georgia, 'Times New Roman', serif", // The premium anchor
  letterSpacing: "-0.2px",
};

const artistText = {
  margin: "0",
  fontSize: "15px",
  color: "#6b7280",
  fontWeight: "400",
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const divider = {
  borderColor: "#f3f4f6", // Softened the divider so it doesn't interrupt the eye
  margin: "20px 0",
};

const label = {
  margin: "0",
  fontSize: "13px",
  fontWeight: "500",
  color: "#6b7280",
  textTransform: "uppercase" as const,
  letterSpacing: "0.8px",
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const priceText = {
  margin: "0",
  fontSize: "16px",
  fontWeight: "600",
  color: "#111827",
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};
