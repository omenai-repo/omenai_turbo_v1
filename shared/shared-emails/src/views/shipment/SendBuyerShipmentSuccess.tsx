import { Heading, Text } from "@react-email/components";
import React from "react";
import ShipmentLayout from "./ShipmentLayout";

export default function SendBuyerShipmentSuccess(
  trackingCode: string,
  name: string
) {
  return (
    <ShipmentLayout
      preview="Great news! Your Shipment Was Successfully Delivered."
      name={name}
    >
      <Heading
        as="h2"
        style={{
          color: "#0f172a",
          fontSize: "24px",
          marginBottom: "20px",
        }}
      >
        Artwork Delivered Successfully!
      </Heading>

      <Text
        style={{
          fontSize: "16px",
          lineHeight: "1.5",
          marginBottom: "16px",
        }}
      >
        Hi {name},
      </Text>

      <Text
        style={{
          fontSize: "16px",
          lineHeight: "1.5",
          marginBottom: "16px",
        }}
      >
        Congratulations! Your Shipment Was Successfully Delivered!
      </Text>

      <Text
        style={{
          fontSize: "16px",
          lineHeight: "1.5",
          marginBottom: "24px",
        }}
      >
        I hope you’re doing well. I’m pleased to inform you that your shipment
        has been successfully delivered.
      </Text>
      <Text
        style={{
          fontSize: "16px",
          lineHeight: "1.5",
          marginBottom: "24px",
        }}
      >
        <strong>Tracking Code : {trackingCode}</strong>
      </Text>
      <Text
        style={{
          fontSize: "16px",
          lineHeight: "1.5",
          marginBottom: "24px",
        }}
      >
        Please check your package and confirm that everything arrived in good
        condition. If you have any questions or concerns, feel free to contact
        me — I’ll be happy to assist.
      </Text>

      <Text
        style={{
          fontSize: "14px",
          lineHeight: "1.5",
          color: "#64748b",
          marginTop: "24px",
        }}
      >
        Thank you for being part of the Omenai community.
      </Text>
    </ShipmentLayout>
  );
}
