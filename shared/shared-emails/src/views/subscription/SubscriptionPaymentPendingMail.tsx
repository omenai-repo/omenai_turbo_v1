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

export const SubscriptionPaymentPendingEmail = (name: string) => {
  return (
    <Html>
      <Head />
      <Preview>Your subscription payment is being processed</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/68d2ab83002025087b36/view?project=682272b1001e9d1609a8"
            alt="Omenai logo"
            width="120"
            style={{ margin: "0 auto 30px" }}
          />

          <Heading style={heading}>⏳ Payment Processing</Heading>
          <Text style={text}>Hi {name},</Text>

          <Text style={text}>
            Thank you for your subscription payment. We wanted to let you know
            that your payment is currently being <strong>processed</strong> by
            our payment provider.
          </Text>

          <Text style={text}>
            This usually takes a few minutes, but can occasionally take up to 24
            hours to complete. Once your payment is confirmed, your subscription
            will be activated automatically and you'll receive a confirmation
            email.
          </Text>

          <Text style={text}>
            <strong>What happens next:</strong>
            <br />
            • We'll monitor your payment status
            <br />
            • You'll receive an email once payment is confirmed
            <br />• Your subscription will be activated immediately after
            confirmation
          </Text>

          <Hr style={hr} />

          <Text style={text}>
            If you don't receive a confirmation email within 24 hours, or if you
            have any questions about your payment, please don't hesitate to
            contact us at{" "}
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
            Thank you for your patience and for choosing <strong>Omenai</strong>
            .
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

export default SubscriptionPaymentPendingEmail;

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
