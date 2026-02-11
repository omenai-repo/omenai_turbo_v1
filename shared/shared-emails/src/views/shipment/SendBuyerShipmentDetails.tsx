import { tracking_url } from "@omenai/url-config/src/config";
import {
  Container,
  Section,
  Text,
  Heading,
  Link,
} from "@react-email/components";
import ArtworkCard from "./ArtworkCard";
import ShipmentLayout from "./ShipmentLayout";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";

export default function BuyerShipmentEmail(
  trackingCode: string,
  name: string,
  artwork: string,
  artworkImage: string,
  artistName: string,
  price: string,
) {
  artworkImage = getImageFileView(artworkImage, 400);
  return (
    <ShipmentLayout
      preview="Your artwork is on the way. Track your shipment now."
      name={name}
    >
      <Container style={{ maxWidth: "600px", margin: "0 auto" }}>
        <Section>
          <Heading
            as="h2"
            style={{
              color: "#0f172a",
              fontSize: "24px",
              marginBottom: "20px",
            }}
          >
            Your artwork is on the Way
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
            Your artwork is currently being prepared for shipment. We’ve created
            a shipment for your piece and it will soon be on its way.
          </Text>
          <Text style={{ fontSize: "16px", lineHeight: "1.5" }}>
            <strong>Tracking Code:</strong> {trackingCode}
          </Text>
          <ArtworkCard
            artwork={artwork}
            artworkImage={artworkImage}
            artistName={artistName}
            price={price}
          />
          <Text style={{ fontSize: "16px", lineHeight: "1.5" }}>
            Open the Omenai App to track your shipment or visit your dashboard
            on the web
          </Text>

          <div style={{ textAlign: "center", margin: "30px 0" }}>
            <Link
              href={`${tracking_url()}?tracking_id=${trackingCode}`}
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
              Track Shipment
            </Link>
          </div>

          <Text style={{ fontSize: "16px", lineHeight: "1.5" }}>
            You can also track your order directly from your dashboard.
          </Text>

          <Text style={{ marginTop: "40px", fontSize: "16px" }}>
            Best regards,
            <br />
            <strong>Omenai</strong>
          </Text>
        </Section>
      </Container>
    </ShipmentLayout>
  );
}
