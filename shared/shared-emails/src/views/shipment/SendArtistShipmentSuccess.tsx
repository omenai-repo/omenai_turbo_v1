import { Text, Heading, Link, Section, Hr } from "@react-email/components";
import { dashboard_url } from "@omenai/url-config/src/config";
import ShipmentLayout from "./ShipmentLayout";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";
import EmailArtworkCard from "../components/EmailArtworkCard";

interface SendArtistShipmentSuccessProps {
  trackingCode: string;
  name: string;
  artwork: string;
  artworkImage: string;
  artistName: string;
  price: string;
}

export default function SendArtistShipmentSuccess({
  trackingCode,
  name,
  artwork,
  artworkImage,
  artistName,
  price,
}: SendArtistShipmentSuccessProps) {
  const optimizedImage = getImageFileView(artworkImage, 400);

  return (
    <ShipmentLayout
      name={name}
      preview="Your artwork has been delivered. Your funds are now available."
    >
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
          Your art has arrived.
        </Heading>

        <Text style={textStyle}>Hi {name},</Text>

        <Text style={textStyle}>
          The collector has successfully received your piece. Thank you for
          trusting Omenai to connect your exceptional work with its new home.
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
            <strong style={{ color: "#111827" }}>Delivery Confirmed:</strong>{" "}
            {trackingCode}
          </Text>
        </Section>

        <EmailArtworkCard
          artwork={artwork}
          artworkImage={optimizedImage}
          artistName={artistName}
          price={price}
        />

        <Hr
          style={{
            borderColor: "#e5e7eb",
            margin: "32px 0",
          }}
        />

        <Heading
          as="h3"
          style={{
            color: "#111827",
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "16px",
          }}
        >
          Your funds are ready
        </Heading>

        <Text style={textStyle}>
          Your earnings from this sale have been released to your Omenai wallet
          and are available for immediate withdrawal.
        </Text>

        <Section style={{ textAlign: "center", margin: "32px 0" }}>
          <Link
            href={`${dashboard_url()}/artist/app/wallet`}
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
            Go to Wallet
          </Link>
        </Section>

        <Text
          style={{
            fontSize: "13px",
            lineHeight: "1.6",
            color: "#6b7280",
            marginTop: "32px",
          }}
        >
          Thank you for elevating the Omenai community. We look forward to your
          next masterpiece.
        </Text>
      </Section>
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
