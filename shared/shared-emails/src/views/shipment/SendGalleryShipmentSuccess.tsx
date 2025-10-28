import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Link,
} from "@react-email/components";
import { dashboard_url } from "@omenai/url-config/src/config";

export default function SendGalleryShipmentSuccess(name: string) {
  return (
    <Html>
      <Head />
      <Preview>Shipment delivery completed and verified successfully.</Preview>
      <Body
        style={{
          backgroundColor: "#ffffff",
          color: "#0f172a",
          fontFamily: "Helvetica, Arial, sans-serif",
          padding: "40px 20px",
        }}
      >
        <Container style={{ maxWidth: "600px", margin: "0 auto" }}>
          <Section
            style={{
              border: "1px solid #eee",
              borderRadius: "12px",
              padding: "32px",
            }}
          >
            <Heading
              as="h2"
              style={{
                color: "#0f172a",
                fontSize: "24px",
                marginBottom: "20px",
              }}
            >
              Shipment Delivery Confirmed
            </Heading>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: "1.5",
                marginBottom: "16px",
              }}
            >
              Hi {name},
            </Text>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: "1.5",
                marginBottom: "16px",
              }}
            >
              Great news! The shipment for your artwork has been successfully
              delivered and verified by the buyer.
            </Text>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: "1.5",
                marginBottom: "24px",
              }}
            >
              The delivery has been confirmed and marked as complete in our
              system. You can view the full details of this transaction in your
              gallery dashboard.
            </Text>

            <div style={{ textAlign: "center", margin: "30px 0" }}>
              <Link
                href={`${dashboard_url()}/gallery/orders`}
                style={{
                  display: "inline-block",
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "16px",
                }}
              >
                View Dashboard
              </Link>
            </div>

            <Text
              style={{
                fontSize: "14px",
                lineHeight: "1.5",
                color: "#64748b",
                marginTop: "24px",
              }}
            >
              Thank you for being part of the Omenai community. We appreciate
              your commitment to delivering exceptional art experiences!
            </Text>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: "1.5",
                marginTop: "32px",
              }}
            >
              If you have any questions about this delivery or need assistance,
              our support team is here to help.
            </Text>

            <Text style={{ marginTop: "40px", fontSize: "16px" }}>
              Best regards,
              <br />
              The Omenai Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
