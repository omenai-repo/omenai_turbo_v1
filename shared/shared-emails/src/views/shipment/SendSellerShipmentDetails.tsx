// components/emails/SellerShipmentEmail.tsx
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Heading,
} from "@react-email/components";
import ArtworkCard from "./ArtworkCard";

export default function SellerShipmentEmail(
  name: string,
  artwork: string,
  artworkImage: string,
  buyerName: string,
  requestDate: string
) {
  return (
    <Html>
      <Head />
      <Preview>Your shipment has been created and is ready for pickup</Preview>
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
              Shipment Created – Prepare for Pickup
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
              A shipment has been successfully created for your piece. DHL’s
              courier service will reach out shortly to schedule a pickup from
              your location.
            </Text>
            <ArtworkCard
              artwork={artwork}
              artworkImage={artworkImage}
              buyerName={buyerName}
              requestDate={requestDate}
            />
            <Text
              style={{
                fontSize: "16px",
                lineHeight: "1.5",
                marginBottom: "16px",
              }}
            >
              Please make sure the artwork is securely packaged and ready for
              pickup. We’ve attached a <strong>waybill document</strong> to this
              email — kindly print it and attach it to the package before
              pickup.{" "}
              <strong>
                Also kindly attach the certificate of authenticity to the
                package or hand this over to the courier to ensure smooth
              </strong>
              delivery.
            </Text>
            <Text style={{ fontSize: "16px", lineHeight: "1.5" }}>
              If you have any questions or concerns, feel free to contact our
              customer care team anytime.
            </Text>
            <Text style={{ marginTop: "40px", fontSize: "16px" }}>
              Best regards,
              <br />
              Omenai
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
