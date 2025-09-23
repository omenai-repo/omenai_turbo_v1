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

export const SubscriptionPaymentSuccessfulEmail = (name: string) => {
  return (
    <Html>
      <Head />
      <Preview>Your subscription has been successfully activated</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/68d2ab83002025087b36/view?project=682272b1001e9d1609a8"
            alt="Omenai logo"
            width="120"
            style={{ margin: "0 auto 30px" }}
          />

          <Heading style={heading}>✅ Subscription Activated</Heading>
          <Text style={text}>Hi {name},</Text>

          <Text style={text}>
            We’re excited to inform you that your recent subscription payment
            was <strong>successful</strong>. Your account is now active, and
            your subscription has been updated accordingly.
          </Text>

          <Text style={text}>
            Thank you for your continued support. Your subscription enables us
            to offer exclusive access, premium features, and ongoing
            improvements to your experience on our platform.
          </Text>

          <Hr style={hr} />

          <Text style={text}>
            If you have any questions or concerns, feel free to contact us at{" "}
            <Link
              href="mailto:contact@omenani.net"
              style={{
                textDecoration: "underline",
                color: "#0f172a",
                fontWeight: "bold",
              }}
            >
              contact@omenani.net
            </Link>
            . We're here to help.
          </Text>

          <Text style={text}>
            Thank you again for choosing <strong>Omenai</strong>.
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

export default SubscriptionPaymentSuccessfulEmail;

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
