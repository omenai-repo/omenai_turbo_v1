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
  Link,
} from "@react-email/components";
import * as React from "react";

interface Props {
  name: string;
  artwork: string;
  amount: string;
  transactionId: string;
  date: string;
  order_id: string;
}

export const PurchaseConfirmationEmail = ({
  name,
  artwork,
  amount,
  transactionId,
  date,
  order_id,
}: Props) => {
  return (
    <Html>
      <Head />
      <Preview>Your purchase has been successfully processed</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://fra.cloud.appwrite.io/v1/storage/buckets/6822733300074eb56561/files/68231da4000e5b382a50/view?project=682272b1001e9d1609a8&mode=admin"
            alt="Omenai logo"
            width="120"
            style={{ margin: "0 auto 30px" }}
          />

          <Heading style={heading}>✅ Purchase Confirmed</Heading>
          <Text style={text}>Hi {name},</Text>
          <Text style={text}>
            Thank you for your purchase of <strong>{artwork}</strong> (Order #
            {order_id}). Your payment has been successfully processed.
          </Text>

          <Section style={section}>
            <Text style={text}>We’re preparing your order for shipment.</Text>
            <Text style={text}>
              A shipment order will be created shortly and you’ll receive
              updates with tracking information and expected delivery.
            </Text>
            <Text style={text}>
              Please keep an eye on your inbox for further instructions.
            </Text>
          </Section>

          <Hr style={hr} />

          <Heading style={subHeading}>🧾 Purchase Receipt</Heading>
          <Section style={receiptSection}>
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
            You can manage and track your order in your{" "}
            <Link
              href="https://omenai.net/dashboard/user/orders"
              style={{
                textDecoration: "underline",
                color: "#0f172a",
                fontWeight: "bold",
              }}
            >
              Account Dashboard
            </Link>
            .
          </Text>

          <Text style={footer}>
            If you have any questions, please reach out to us at{" "}
            <Link
              href="mailto:contact@omenani.net"
              style={{ textDecoration: "underline", color: "#0f172a" }}
            >
              contact@omenani.net
            </Link>
            .
          </Text>
          <Text style={footer}>Thank you for shopping with Omenai.</Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PurchaseConfirmationEmail;

const main = {
  backgroundColor: "#ffffff",
  color: "#0f172a",
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
  textAlign: "center",
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
  color: "#0f172a",
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
