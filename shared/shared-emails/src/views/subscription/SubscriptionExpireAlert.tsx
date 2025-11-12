import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Heading,
  Hr,
  Img,
} from "@react-email/components";
import * as React from "react";

export const SubscriptionExpireAlert = (name: string, day: string) => {
  return (
    <Html>
      <Head />
      <Preview>Your Subscription Expires {day}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/68d2ab83002025087b36/view?project=682272b1001e9d1609a8"
            alt="Omenai logo"
            width="120"
            style={{ margin: "0 auto 30px" }}
          />

          <Heading style={heading}>Your Subscription Expires {day}</Heading>
          <Text style={text}>Hi {name},</Text>

          <Text style={text}>
            We wanted to let you know that your subscription will expire {day}.
          </Text>

          <Text style={text}>
            To ensure uninterrupted access to your account and all your
            benefits, please renew your subscription before it expires.
          </Text>

          <Text style={text}>
            If you’ve already renewed or have any questions about your plan, you
            can safely ignore this message or contact us anytime.
          </Text>

          <Hr style={hr} />

          <Text style={text}>
            Thank you for choosing <strong>Omenai</strong>.
          </Text>

          <Text style={text}>
            Best regards,
            <br />
            Moses from Omenai
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            This email was intended for <strong>{name}</strong>. If you received
            this in error, please disregard or delete it. Unauthorized use or
            distribution of this email is prohibited.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default SubscriptionExpireAlert;

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

const text = {
  fontSize: "16px",
  lineHeight: "1.6",
  marginBottom: "16px",
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
