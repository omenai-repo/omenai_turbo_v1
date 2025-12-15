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
import { container, footer, heading, hr, main, text } from "./style";

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
            Please ensure sufficient funds are available in your payment method
            to avoid any interruption to your service. We'll process the payment{" "}
            {day}.
          </Text>

          <Text style={text}>
            If you need to update your payment information or have any questions
            about your billing, please visit your account settings or contact
            our support team.
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
