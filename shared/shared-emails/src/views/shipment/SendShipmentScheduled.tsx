import { Container, Section, Text, Heading } from "@react-email/components";
import ArtworkCard from "./ArtworkCard";
import ShipmentLayout from "./ShipmentLayout";
import { base_url } from "@omenai/url-config/src/config";

export default function SendShipmentScheduled(
  name: string,
  artworkId: string,
  artwork: string,
  artworkImage: string,
  artistName: string,
  price: string
) {
  return (
    <ShipmentLayout
      name={name}
      preview={`A shipment has been successfully created for your piece (${artwork})`}
    >
      <Container style={{ maxWidth: "600px", margin: "0 auto" }}>
        <Section>
          <Heading
            as="h2"
            style={{
              color: "#0f172a",
              fontSize: "24px",
              marginBottom: "20px",
              textAlign: "center",
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
            A shipment has been successfully created for your piece (
            <a href={`${base_url()}/artwork/${artworkId}`}>{artwork}</a>).
          </Text>
          <ArtworkCard
            artwork={artwork}
            artworkImage={artworkImage}
            price={price}
            artistName={artistName}
          />
          <Text style={{ fontSize: "16px", lineHeight: "1.5" }}>
            DHL's courier will reach out shortly to schedule a pickup from your
            location. Please make sure the artwork is securely packaged and
            ready for pickup. A <strong>waybill document</strong> will be sent
            to you, kindly print and attach to the package before pickup or
            handover to the courier at pickup. Also kindly attach the{" "}
            <strong>certificate of authenticity</strong> to the package or hand
            this over to the courrier to ensure smooth delivery
          </Text>

          <Text style={{ fontSize: "16px", lineHeight: "1.5" }}>
            Best regards, <br />
            <strong>Omenai</strong>
          </Text>
        </Section>
      </Container>
    </ShipmentLayout>
  );
}
