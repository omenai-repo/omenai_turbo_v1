import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
} from "@react-email/components";
import React from "react";
import EmailFooter from "../../components/Footer";

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
        {children}
        <EmailFooter recipientName={name} />
      </Body>
    </Html>
  );
}
