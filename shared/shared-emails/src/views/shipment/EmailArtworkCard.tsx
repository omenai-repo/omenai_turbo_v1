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

export default function EmailArtworkCard({
  artwork,
  artworkImage,
  artistName,
  price,
}: Readonly<{
  artwork: string;
  artworkImage: string;
  artistName: string;
  price: string;
}>) {
  return (
    <Container style={card}>
      {/* Image Section */}
      <Section style={imageWrapper}>
        <Img src={artworkImage} alt={artwork} width={320} style={image} />
      </Section>

      {/* Details Section */}
      <Section style={detailsWrapper}>
        <Text style={artworkTitle}>{artwork}</Text>
        <Text style={artistText}>by {artistName}</Text>

        <Hr style={divider} />

        {/* Bulletproof Table-Based Row for Price */}
        <Row>
          <Column align="left">
            <Text style={label}>Price</Text>
          </Column>
          <Column align="right">
            <Text style={priceText}>{price}</Text>
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
  borderRadius: "12px",
  overflow: "hidden",
  maxWidth: "360px",
  margin: "40px auto",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
};

const imageWrapper = {
  backgroundColor: "#f9fafb",
  padding: "24px 20px",
  textAlign: "center" as const,
};

const image = {
  display: "block",
  maxWidth: "100%",
  width: "320px",
  height: "auto",
  margin: "0 auto",
  borderRadius: "4px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  imageRendering: "-webkit-optimize-contrast" as const,
};

const detailsWrapper = {
  padding: "24px",
};

const artworkTitle = {
  margin: "0 0 4px 0",
  fontSize: "20px",
  fontWeight: "600",
  color: "#111827",
  fontFamily: "Georgia, serif", // Serif gives a premium, art-gallery feel
};

const artistText = {
  margin: "0",
  fontSize: "15px",
  color: "#6b7280",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const divider = {
  borderColor: "#e5e7eb",
  margin: "20px 0",
};

const label = {
  margin: "0",
  fontSize: "14px",
  fontWeight: "500",
  color: "#6b7280",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const priceText = {
  margin: "0",
  fontSize: "16px",
  fontWeight: "600",
  color: "#111827",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};
