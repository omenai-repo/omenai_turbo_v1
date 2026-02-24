import { tracking_url } from "@omenai/url-config/src/config";
import {
  Container,
  Section,
  Text,
  Heading,
  Link,
  Hr,
} from "@react-email/components";
import EmailArtworkCard from "../components/EmailArtworkCard";
import ShipmentLayout from "./ShipmentLayout";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";

interface BuyerShipmentEmailProps {
  trackingCode: string;
  name: string;
  artwork: string;
  artworkImage: string;
  artistName: string;
  price: string;
}

export default function BuyerShipmentEmail({
  trackingCode,
  name,
  artwork,
  artworkImage,
  artistName,
  price,
}: BuyerShipmentEmailProps) {
  const optimizedImage = getImageFileView(artworkImage, 400);

  return (
    <ShipmentLayout
      preview={`Track your shipment: ${artwork} by ${artistName} is on its way.`}
      name={name}
    >
      <Container style={{ maxWidth: "600px", margin: "0 auto" }}>
        <Section style={{ padding: "10px 0" }}>
          <Heading
            as="h2"
            style={{
              color: "#111827",
              fontSize: "24px",
              fontWeight: "600",
              letterSpacing: "-0.5px",
              marginBottom: "24px",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Your acquisition is en route.
          </Heading>

          <Text style={textStyle}>Dear {name},</Text>

          <Text style={textStyle}>
            The wait is almost over. Your newly acquired piece has been
            carefully prepared by the artist and is now in transit. We have
            partnered with our trusted logistics providers to ensure it arrives
            safely at your doorstep.
          </Text>

          {/* Stylized Tracking Box */}
          <Section
            style={{
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              padding: "16px",
              margin: "24px 0",
              border: "1px solid #e5e7eb",
            }}
          >
            <Text style={{ ...textStyle, margin: "0", color: "#4b5563" }}>
              <strong style={{ color: "#111827" }}>Tracking Number:</strong>{" "}
              {trackingCode}
            </Text>
          </Section>

          <EmailArtworkCard
            artwork={artwork}
            artworkImage={optimizedImage}
            artistName={artistName}
            price={price}
          />

          <Section style={{ textAlign: "center", margin: "32px 0" }}>
            <Link
              href={`${tracking_url()}?tracking_id=${trackingCode}`}
              style={{
                display: "inline-block",
                backgroundColor: "#000000",
                color: "#ffffff",
                padding: "14px 28px",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "15px",
                fontWeight: "500",
                letterSpacing: "0.3px",
              }}
            >
              Track Your Shipment
            </Link>
          </Section>

          <Text style={textStyle}>
            You can monitor your shipment's progress in real-time using the
            Omenai App or by visiting your dashboard on the web.
          </Text>

          <Hr
            style={{
              borderColor: "#e5e7eb",
              margin: "32px 0",
            }}
          />

          <Text style={{ ...textStyle, color: "#6b7280", fontSize: "14px" }}>
            Warmly,
            <br />
            <strong style={{ color: "#111827" }}>The Omenai Team</strong>
          </Text>
        </Section>
      </Container>
    </ShipmentLayout>
  );
}

// Shared text style for consistency
const textStyle = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#374151",
  marginBottom: "16px",
};
