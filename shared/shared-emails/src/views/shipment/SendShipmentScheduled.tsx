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

export default function SendShipmentScheduled(
  name: string,
  artwork: string,
  artworkImage: string,
  buyerName: string,
  requestDate: string
) {
  return (
    <Html>
      <Head />
      <Preview>Shipment Created - Prepare for Pickup</Preview>
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
              Shipment Created - Prepare for Pickup
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
              A shipment has been successfully created for your piece. DHL's
              courier will reach out shortly to schedule a pickup from your
              location.
            </Text>
            <ArtworkCard
              artwork={artwork}
              artworkImage={artworkImage}
              buyerName={buyerName}
              requestDate={requestDate}
            />
            <Text style={{ fontSize: "16px", lineHeight: "1.5" }}>
              Please make sure the artwork is securely packaged and ready for
              pickup. we've attached a <strong>waybill document</strong> to this
              email - kindly print it and attach to the package before pickup.{" "}
              <strong>
                Also kindly attach the certificate of authenticity to the
                package or hand this over to the courrier to ensure smooth
                delivery
              </strong>
            </Text>

            <Text
              style={{ fontSize: "16px", lineHeight: "1.5", marginTop: "24px" }}
            >
              If you have any questions, feel free to contact our customer care
              team anytime.
            </Text>

            <Text style={{ marginTop: "40px", fontSize: "16px" }}>
              Best regards,
              <br />
              <strong>Omenai</strong>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
