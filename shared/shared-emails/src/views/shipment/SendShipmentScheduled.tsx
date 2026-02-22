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
import { base_url } from "@omenai/url-config/src/config";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";

interface SendShipmentScheduledProps {
  name: string;
  artworkId: string;
  artwork: string;
  artworkImage: string;
  artistName: string;
  price: string;
  email?: string; // Standardized for your testing
}

export default function SendShipmentScheduled({
  name,
  artworkId,
  artwork,
  artworkImage,
  artistName,
  price,
}: SendShipmentScheduledProps) {
  const optimizedImage = getImageFileView(artworkImage, 400);

  return (
    <ShipmentLayout
      name={name}
      preview={`Logistics confirmed: Courier pickup scheduled for ${artwork}.`}
    >
      {/* Dark Mode Overrides */}
      <style>
        {`
          @media (prefers-color-scheme: dark) {
            .text-main { color: #e5e7eb !important; }
            .text-muted { color: #9ca3af !important; }
            .heading-main { color: #ffffff !important; }
            .bg-box { background-color: #1f2937 !important; border-color: #374151 !important; }
            .link-main { color: #60a5fa !important; }
          }
        `}
      </style>

      <Container style={{ maxWidth: "600px", margin: "0 auto" }}>
        <Section style={{ padding: "10px 0" }}>
          <Heading
            as="h2"
            className="heading-main"
            style={{
              color: "#111827",
              fontSize: "24px",
              fontWeight: "600",
              letterSpacing: "-0.5px",
              marginBottom: "24px",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Your Shipment is Scheduled
          </Heading>

          <Text className="text-main" style={textStyle}>
            Hello {name},
          </Text>

          <Text className="text-main" style={textStyle}>
            Logistics have been successfully coordinated for your piece,{" "}
            <Link
              href={`${base_url()}/artwork/${artworkId}`}
              className="link-main"
              style={{
                color: "#2563eb",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              {artwork}
            </Link>
            . Our logistics courier will be reaching out to you shortly to
            arrange a precise time for collection.
          </Text>

          <EmailArtworkCard
            artwork={artwork}
            artworkImage={optimizedImage}
            price={price}
            artistName={artistName}
          />

          <Text
            className="text-main"
            style={{
              ...textStyle,
              marginTop: "32px",
              fontWeight: "600",
              color: "#111827",
            }}
          >
            Logistics Handover Checklist
          </Text>

          <Text
            className="text-muted"
            style={{ ...textStyle, fontSize: "15px", marginBottom: "20px" }}
          >
            To ensure a seamless collection and delivery process, please
            complete the following steps before the courier arrives:
          </Text>

          {/* Step 1 */}
          <Section className="bg-box" style={stepBoxStyle}>
            <Text className="heading-main" style={stepHeadingStyle}>
              1. Secure Packaging
            </Text>
            <Text className="text-muted" style={stepTextStyle}>
              Ensure the artwork is professionally padded, securely packaged,
              and ready for international transit prior to the courier's
              arrival.
            </Text>
          </Section>

          {/* Step 2 */}
          <Section className="bg-box" style={stepBoxStyle}>
            <Text className="heading-main" style={stepHeadingStyle}>
              2. Print & Attach the Waybill
            </Text>
            <Text className="text-muted" style={stepTextStyle}>
              A separate email containing your official waybill document will be
              sent to you. You must print this document and securely attach it
              to the exterior of the package.
            </Text>
          </Section>

          {/* Step 3 */}
          <Section className="bg-box" style={stepBoxStyle}>
            <Text className="heading-main" style={stepHeadingStyle}>
              3. Certificate of Authenticity
            </Text>
            <Text className="text-muted" style={stepTextStyle}>
              Securely attach the Certificate of Authenticity to the package or
              hand it directly to the logistics representative during collection
              to ensure clearance and buyer satisfaction.
            </Text>
          </Section>

          <Hr
            className="bg-box"
            style={{
              borderColor: "#e5e7eb",
              margin: "32px 0",
            }}
          />

          <Text
            className="text-muted"
            style={{ ...textStyle, color: "#6b7280", fontSize: "14px" }}
          >
            Thank you for your prompt cooperation. If you encounter any issues
            with packaging or documentation, please contact our support team
            immediately.
            <br />
            Warmly,
            <br />
            <strong className="heading-main" style={{ color: "#111827" }}>
              Omenai Logistics Team
            </strong>
          </Text>
        </Section>
      </Container>
    </ShipmentLayout>
  );
}

// Shared Styles
const textStyle = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#374151",
  marginBottom: "16px",
};

const stepBoxStyle = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "16px",
  border: "1px solid #e5e7eb",
};

const stepHeadingStyle = {
  fontSize: "15px",
  fontWeight: "600",
  color: "#111827",
  margin: "0 0 6px 0",
};

const stepTextStyle = {
  fontSize: "14px",
  lineHeight: "1.5",
  color: "#4b5563",
  margin: "0",
};
