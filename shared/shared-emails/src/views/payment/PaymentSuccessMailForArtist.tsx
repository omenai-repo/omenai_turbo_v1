import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Img,
} from "@react-email/components";
import * as React from "react";

interface Props {
  name: string;
  artwork: string;
  amount: string;
  transactionId: string;
  date: string;
}

export const PaymentSuccessMailArtist = ({
  name,
  artwork,
  amount,
  transactionId,
  date,
}: Props) => {
  return (
    <Html>
      <Head />
      <Preview>Your artwork has been sold – next steps</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>🎉 Your Artwork Has Been Sold</Heading>
          <Text style={text}>Hi {name},</Text>
          <Text style={text}>
            Great news! A collector has successfully purchased your artwork,{" "}
            <strong>{artwork}</strong>.
          </Text>

          <Section style={section}>
            <Text style={text}>
              The payment has been processed and the funds have been added to
              your <strong>pending balance</strong> in your wallet.
            </Text>
            <Text style={text}>
              A <strong>shipment will be created</strong> and a{" "}
              <strong>courier pickup</strong> will be scheduled shortly.
            </Text>
            <Text style={text}>
              Please ensure the piece is <strong>packaged and ready</strong> for
              shipment.
            </Text>
            <Text style={text}>
              Further shipping instructions and the waybill will be sent to you
              via email.
            </Text>
          </Section>

          <Hr style={hr} />

          <Heading style={subHeading}>🧾 Payment Receipt</Heading>
          <Section style={receiptSection}>
            <Img
              src="https://yourdomain.com/logo.png"
              alt="Platform Logo"
              width="120"
              style={{ marginBottom: "20px" }}
            />
            <div style={receiptRow}>
              <span style={label}>Artwork:</span> <span>{artwork}</span>
            </div>
            <div style={receiptRow}>
              <span style={label}>Amount:</span> <span>{amount}</span>
            </div>
            <div style={receiptRow}>
              <span style={label}>Transaction ID:</span>{" "}
              <span>{transactionId}</span>
            </div>
            <div style={receiptRow}>
              <span style={label}>Date:</span> <span>{date}</span>
            </div>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            Once the buyer receives the piece, the funds will be{" "}
            <strong>unlocked</strong> and available for withdrawal.
          </Text>

          <Text style={footer}>
            If you have any questions or need help, feel free to reach out to
            our support team.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PaymentSuccessMailArtist;

const main = {
  backgroundColor: "#ffffff",
  color: "#1a1a1a",
  fontFamily: "Helvetica, Arial, sans-serif",
  padding: "40px 0",
} as const;

const container = {
  backgroundColor: "#ffffff",
  padding: "40px",
  borderRadius: "12px",
  maxWidth: "600px",
  margin: "0 auto",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
} as const;

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  marginBottom: "20px",
} as const;

const subHeading = {
  fontSize: "18px",
  fontWeight: "bold",
  margin: "24px 0 12px",
} as const;

const text = {
  fontSize: "16px",
  lineHeight: "1.6",
  marginBottom: "16px",
} as const;

const section = {
  marginBottom: "24px",
} as const;

const receiptSection = {
  padding: "24px",
  backgroundColor: "#f9f9f9",
  borderRadius: "12px",
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#1a1a1a",
} as const;

const receiptRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "10px",
} as const;

const label = {
  fontWeight: "bold",
} as const;

const hr = {
  border: "none",
  borderTop: "1px solid #EAEAEA",
  margin: "20px 0",
} as const;

const footer = {
  fontSize: "14px",
  color: "#666666",
} as const;
