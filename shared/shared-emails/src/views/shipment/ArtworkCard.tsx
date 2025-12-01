import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { Img, Section, Text } from "@react-email/components";
import React from "react";

export default function ArtworkCard({
  artwork,
  artworkImage,
  artworkPrice,
  artistName,
}: {
  artwork: string;
  artworkImage: string;
  artworkPrice: number;
  artistName: string;
}) {
  return (
    <Section
      style={{
        border: "1px solid #e5e5e5",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "20px",
        backgroundColor: "#fafafa",
      }}
    >
      <table style={{ width: "100%" }}>
        <tbody>
          <tr>
            <td style={{ width: "120px", verticalAlign: "top" }}>
              <Img
                src={artworkImage}
                width="120"
                height="120"
                alt="Omenai logo"
                className="mx-auto my-10"
              />
            </td>
            <td style={{ verticalAlign: "top", paddingLeft: "16px" }}>
              <Text
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  marginBottom: "4px",
                  color: "#1a1a1a",
                }}
              >
                {artwork}
              </Text>
              <Text
                style={{
                  fontSize: "14px",
                  color: "#666",
                  marginBottom: "8px",
                }}
              >
                by {artistName}
              </Text>
              <Text
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                }}
              >
                {formatPrice(artworkPrice)}
              </Text>
            </td>
          </tr>
        </tbody>
      </table>
    </Section>
  );
}
