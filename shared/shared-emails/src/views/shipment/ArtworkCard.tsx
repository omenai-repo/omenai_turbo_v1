import { Img, Section, Text } from "@react-email/components";
import React from "react";

export default function ArtworkCard({
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
    <Section className="my-8 p-6 bg-gray-50 rounded">
      <div style={{ textAlign: "center", width: "100%" }}>
        <Img
          src={artworkImage}
          alt={artwork}
          className="mx-auto rounded shadow-md"
          width={200}
          style={{
            display: "block",
            maxWidth: "200px",
            width: "200px",
            height: "auto",
            margin: "0 auto",
            imageRendering: "-webkit-optimize-contrast",
          }}
        />
      </div>

      {/* Order Details */}
      <div style={{ marginTop: "24px", width: "100%" }}>
        <div
          style={{
            marginBottom: "10px",
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              color: "#4b5563",
              fontSize: "16px",
              fontWeight: 600,
              margin: 0,
              width: "200px",
              display: "inline-block",
            }}
          >
            Artwork:
          </Text>
          <Text
            style={{
              color: "#0f172a",
              fontSize: "14px",
              margin: 0,
              display: "inline-block",
            }}
          >
            {artwork}
          </Text>
        </div>

        <div style={{ marginBottom: "10px", display: "flex" }}>
          <Text
            style={{
              color: "#4b5563",
              fontSize: "16px",
              fontWeight: 600,
              margin: 0,
              width: "200px",
              display: "inline-block",
            }}
          >
            Artist:
          </Text>
          <Text
            style={{
              color: "#0f172a",
              fontSize: "14px",
              margin: 0,
              display: "inline-block",
            }}
          >
            {artistName}
          </Text>
        </div>

        <div style={{ marginBottom: "10px", display: "flex" }}>
          <Text
            style={{
              color: "#4b5563",
              fontSize: "16px",
              fontWeight: 600,
              margin: 0,
              width: "200px",
              display: "inline-block",
            }}
          >
            Price:
          </Text>
          <Text
            style={{
              color: "#0f172a",
              fontSize: "14px",
              margin: 0,
              display: "inline-block",
            }}
          >
            {price}
          </Text>
        </div>
      </div>
    </Section>
  );
}
