// components/emails/BuyerShipmentEmail.tsx
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

export default function BuyerShipmentEmail(trackingCode: string, name: string) {
  return (
    <Html>
      <Head />
      <Preview>Your artwork is on the way. Track your shipment now.</Preview>
      <Body
        style={{
          backgroundColor: "#ffffff",
          color: "#1a1a1a",
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
                color: "#1a1a1a",
                fontSize: "24px",
                marginBottom: "20px",
              }}
            >
              Your Shipment is on the Way
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
              Your artwork is currently being prepared for shipment. We’ve
              created a shipment for your piece and it will soon be on its way.
            </Text>
            <Text style={{ fontSize: "16px", lineHeight: "1.5" }}>
              <strong>Tracking Code:</strong> {trackingCode}
            </Text>
            <Text style={{ fontSize: "16px", lineHeight: "1.5" }}>
              Open the Omenai App to track your shipment or visit your dashboard
              on the web
            </Text>

            <div style={{ textAlign: "center", margin: "30px 0" }}>
              <Link
                href={"https://dashboard.omenai.app/user/orders"}
                style={{
                  display: "inline-block",
                  backgroundColor: "#1a1a1a",
                  color: "#ffffff",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "16px",
                }}
              >
                Track Shipment
              </Link>
            </div>

            <Text style={{ fontSize: "16px", lineHeight: "1.5" }}>
              You can also track your order directly from your dashboard.
            </Text>

            <Text
              style={{ fontSize: "16px", lineHeight: "1.5", marginTop: "24px" }}
            >
              If you have any questions, feel free to contact our customer care
              team.
            </Text>

            <Text style={{ marginTop: "40px", fontSize: "16px" }}>
              Best regards,
              <br />
              The [Your Platform Name] Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
