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
  trackingCode: string,
  name: string,
  artwork: string,
  artworkImage: string,
  artistName: string,
  artworkPrice: number
) {
  return (
    <Html>
      <Head />
      <Preview>Shipment Creation Scheduled for Later</Preview>
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
              Shipment Creation Scheduled for Later
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
              This is to inform you that the creation of the shipment for your
              order{" "}
              <strong>
                #{trackingCode} - {artwork}
              </strong>{" "}
              has been scheduled for a later time. The processing of this
              shipment is currently pending due to the piece currently being on
              exhibition at the gallery and shipment will commence as soon as
              the necessary conditions are met. Once the shipment has been
              created and prepared for dispatch, you will receive an automated
              update confirming the status change.
            </Text>
            <ArtworkCard
              artistName={artistName}
              artwork={artwork}
              artworkImage={artworkImage}
              artworkPrice={artworkPrice}
            />
            <Text style={{ fontSize: "16px", lineHeight: "1.5" }}>
              Please note that no further action is required at this stage. Our
              logistics system will automatically proceed with shipment creation
              once scheduling criteria are fulfilled. If additional information
              or documentation becomes necessary, our support team will reach
              out directly.
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
              The <strong>Omenai</strong> Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
