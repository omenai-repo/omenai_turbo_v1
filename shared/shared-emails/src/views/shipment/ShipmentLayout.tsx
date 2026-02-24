import { Body, Head, Html, Preview } from "@react-email/components";
import React from "react";
import EmailFooter from "../../components/Footer";

interface ShipmentLayoutProps {
  preview: string;
  children: React.ReactNode;
  name: string;
}

export default function ShipmentLayout({
  preview,
  children,
  name,
}: ShipmentLayoutProps) {
  return (
    <Html>
      <Head>
        {/* Global Dark Mode Architecture */}
        <style>
          {`
            @media (prefers-color-scheme: dark) {
              body {
                background-color: #000000 !important;
                color: #e5e7eb !important;
              }
            }
          `}
        </style>
      </Head>
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: "#ffffff",
          color: "#111827",
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          padding: "40px 20px",
          margin: "0 auto",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        {children}

        <EmailFooter recipientName={name} />
      </Body>
    </Html>
  );
}
