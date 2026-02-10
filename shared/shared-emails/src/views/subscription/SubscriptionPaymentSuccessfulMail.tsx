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
  Link,
} from "@react-email/components";
import * as React from "react";
import { container, footer, heading, hr, main, text } from "./style";

export const SubscriptionPaymentSuccessfulEmail = (name: string) => {
  return (
    <Html>
      <Head />
      <Preview>Your subscription has been successfully activated</Preview>
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
