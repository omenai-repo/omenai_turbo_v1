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

export default function ShipmentLayout({
  preview,
  children,
  name,
}: {
  preview: string;
  children: React.ReactNode;
  name: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
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
            {children}

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
