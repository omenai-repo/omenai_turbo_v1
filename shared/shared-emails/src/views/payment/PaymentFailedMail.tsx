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
  buyerName: string;
  artwork: string;
}

export const PaymentFailedEmail = (buyerName: string, artwork: string) => {
  return (
    <Html>
      <Head />
      <Preview>Unsuccessful payment for your artwork purchase</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={
              "https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/696ee3b60025e2a2c4ff/view?project=682272b1001e9d1609a8"
            }
            alt="Omenai logo"
            width="120"
            style={{ margin: "0 auto 30px" }}
          />

          <Heading style={heading}>⚠️ Payment Unsuccessful</Heading>
          <Text style={text}>Hi {buyerName},</Text>
          <Text style={text}>
            We attempted to process your payment for <strong>{artwork}</strong>,
            but unfortunately the transaction was not successful.
          </Text>
          <Text style={text}>
            Please verify your payment method and try again. If you believe this
            was a mistake or need assistance, don't hesitate to contact our
            support team.
          </Text>

          <Text style={footer}>
            If you have any questions or need help resolving this issue, please
            reach out to us at{" "}
            <Link
              href="mailto:contact@omenani.net"
              style={{ textDecoration: "underline", color: "#0f172a" }}
            >
              contact@omenani.net
            </Link>
            .
          </Text>
          <Text style={footer}>Thank you for your interest in Omenai.</Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PaymentFailedEmail;

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
