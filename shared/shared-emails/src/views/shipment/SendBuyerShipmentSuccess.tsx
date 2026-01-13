import { Heading, Text } from "@react-email/components";
import React from "react";
import ShipmentLayout from "./ShipmentLayout";
import ArtworkCard from "./ArtworkCard";

export default function SendBuyerShipmentSuccess(
  trackingCode: string,
  name: string,
  artwork: string,
  artworkImage: string,
  buyerName: string,
  requestDate: string
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
        This is an official notification confirming that the shipment for your
        order <strong>{trackingCode}</strong> has been successfully completed.
        The package was dispatched under tracking number{" "}
        <strong>{trackingCode}</strong> and has been delivered to the address
        provided during the order process.
      </Text>
      <ArtworkCard
        artwork={artwork}
        artworkImage={artworkImage}
        buyerName={buyerName}
        requestDate={requestDate}
      />
      <Text
        style={{
          fontSize: "16px",
          lineHeight: "1.5",
          marginBottom: "24px",
        }}
      >
        Please note that this message serves as confirmation of successful
        shipment and delivery. If there are any discrepancies regarding the
        items received or if further assistance is required, you may contact our
        customer support team. Our representatives will be available to assist
        you with any inquiries related to this order.
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
