import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import React from "react";

export default function SendBuyerShipmentSuccess(
  trackingCode: string,
  name: string
) {
  return (
    <Html>
      <Head />
      <Preview>Great news! Your Shipment Was Successfully Delivered.</Preview>
      <Body
        style={{
          backgroundColor: "#ffffff",
          color: "#0f172a",
          fontFamily: "Helvetica, Arial, sans-serif",
          padding: "40px 20px",
        }}
      >
        <Container style={{ maxWidth: "600px", margin: "0 auto" }}>
          <Section
            style={{
              border: "1px solid #eee",
              borderRadius: "12px",
              padding: "32px",
            }}
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
              I hope you’re doing well. I’m pleased to inform you that your
              shipment has been successfully delivered.
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
              Please check your package and confirm that everything arrived in
              good condition. If you have any questions or concerns, feel free
              to contact me — I’ll be happy to assist.
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

            <Text
              style={{
                fontSize: "16px",
                lineHeight: "1.5",
                marginTop: "32px",
              }}
            >
              If you have any questions or need assistance, our support team is
              here to help.
            </Text>

            <Text style={{ marginTop: "40px", fontSize: "16px" }}>
              Best regards,
              <br />
              The Omenai Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
