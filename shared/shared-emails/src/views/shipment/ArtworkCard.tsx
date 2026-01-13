import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { Img, Section, Text } from "@react-email/components";
import React from "react";

export default function ArtworkCard({
  artwork,
  artworkImage,
  buyerName,
  requestDate,
}: Readonly<{
  artwork: string;
  artworkImage: string;
  buyerName: string;
  requestDate: string;
}>) {
  return (
    <Section className="my-8 p-6 bg-gray-50 rounded">
      <div className="text-center">
        <Img
          src={artworkImage}
          alt={artwork}
          className="mx-auto rounded shadow-md"
          style={{
            maxWidth: "280px",
            width: "100%",
            height: "auto",
            maxHeight: "320px",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Order Details */}
      <table
        className="w-full mt-6"
        style={{ borderCollapse: "separate", borderSpacing: "0 8px" }}
      >
        <thead>
          <tr>
            <th
              scope="col"
              style={{
                position: "absolute",
                display: "none",
                width: "1px",
                height: "1px",
                padding: 0,
                margin: "-1px",
                overflow: "hidden",
                clip: "rect(0, 0, 0, 0)",
                whiteSpace: "nowrap",
                border: 0,
              }}
            >
              Artwork Image
            </th>
            <th
              scope="col"
              style={{
                position: "absolute",
                display: "none",
                width: "1px",
                height: "1px",
                padding: 0,
                margin: "-1px",
                overflow: "hidden",
                clip: "rect(0, 0, 0, 0)",
                whiteSpace: "nowrap",
                border: 0,
              }}
            >
              Artwork Details (Title, Artist, Price)
            </th>
          </tr>
        </thead>
        <tr>
          <td style={{ padding: "8px 0", width: "120px" }}>
            <Text
              className="text-sm font-semibold m-0"
              style={{ color: "#4b5563" }}
            >
              Artwork:
            </Text>
          </td>
          <td style={{ padding: "8px 0" }}>
            <Text className="text-sm m-0" style={{ color: "#0f172a" }}>
              {artwork}
            </Text>
          </td>
        </tr>
        <tr>
          <td style={{ padding: "8px 0" }}>
            <Text
              className="text-sm font-semibold m-0"
              style={{ color: "#4b5563" }}
            >
              Buyer:
            </Text>
          </td>
          <td style={{ padding: "8px 0" }}>
            <Text className="text-sm m-0" style={{ color: "#0f172a" }}>
              {buyerName}
            </Text>
          </td>
        </tr>
        <tr>
          <td style={{ padding: "8px 0" }}>
            <Text
              className="text-sm font-semibold m-0"
              style={{ color: "#4b5563" }}
            >
              Request Date:
            </Text>
          </td>
          <td style={{ padding: "8px 0" }}>
            <Text className="text-sm m-0" style={{ color: "#0f172a" }}>
              {requestDate}
            </Text>
          </td>
        </tr>
      </table>
    </Section>
  );
}
