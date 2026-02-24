// components/emails/SellerShipmentEmail.tsx
import { Container, Section, Text, Heading, Hr } from "@react-email/components";
import ShipmentLayout from "./ShipmentLayout";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import EmailArtworkCard from "../components/EmailArtworkCard";

interface SellerShipmentEmailProps {
  name: string;
  artwork: string;
  artworkImage: string;
  artistName: string;
  price: string;
  email?: string;
}

export default function SellerShipmentEmail({
  name,
  artwork,
  artworkImage,
  artistName,
  price,
}: SellerShipmentEmailProps) {
  const artworkImageUrl = getOptimizedImage(artworkImage, "small");

  return (
    <ShipmentLayout
      preview="Action Required: Your shipping labels are ready. Please prepare your artwork for pickup."
      name={name}
    >
      {/* Dark Mode Overrides */}
      <style>
        {`
          @media (prefers-color-scheme: dark) {
            .text-main { color: #e5e7eb !important; }
            .text-muted { color: #9ca3af !important; }
            .heading-main { color: #ffffff !important; }
            .bg-box { background-color: #1f2937 !important; border-color: #374151 !important; }
            .alert-text { color: #ef4444 !important; }
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
            Action Required: Prepare for Dispatch
          </Heading>

          <Text className="text-main" style={textStyle}>
            Hello {name},
          </Text>

          <Text className="text-main" style={textStyle}>
            Your shipping documents have been successfully generated. Our
            logistics partner will be reaching out shortly to schedule the
            collection of your artwork.
          </Text>

          <EmailArtworkCard
            artwork={artwork}
            artworkImage={artworkImageUrl}
            artistName={artistName}
            price={price}
          />

          <Text
            className="text-main"
            style={{ ...textStyle, marginTop: "32px", fontWeight: "500" }}
          >
            To ensure a seamless handover to our Logistics couriers and to
            prevent any customs delays, you must complete the following steps
            prior to their arrival:
          </Text>

          {/* Step 1 */}
          <Section className="bg-box" style={stepBoxStyle}>
            <Text className="heading-main" style={stepHeadingStyle}>
              1. Print All Attached Documents
            </Text>
            <Text className="text-muted" style={stepTextStyle}>
              This email includes your complete shipping packet in a single PDF
              file. Please print the entire document.
            </Text>
          </Section>

          {/* Step 2 */}
          <Section className="bg-box" style={stepBoxStyle}>
            <Text className="heading-main" style={stepHeadingStyle}>
              2. Attach the Shipping Label
            </Text>
            <Text className="text-muted" style={stepTextStyle}>
              The first page is your primary shipping label. Securely affix this
              to the outside of your package where it is clearly visible.
            </Text>
          </Section>

          {/* Step 3 - Critical Customs Warning */}
          <Section
            className="bg-box"
            style={{ ...stepBoxStyle, borderColor: "#fca5a5" }}
          >
            <Text className="heading-main" style={stepHeadingStyle}>
              3. Attach the Commercial Invoice (Customs)
            </Text>
            <Text className="text-muted" style={stepTextStyle}>
              Print three (3) copies of the commercial invoice and place them in
              a clear, external pouch.{" "}
              <strong className="alert-text" style={{ color: "#dc2626" }}>
                DO NOT place customs documents inside the package.
              </strong>
            </Text>
          </Section>

          {/* Step 4 */}
          <Section className="bg-box" style={stepBoxStyle}>
            <Text className="heading-main" style={stepHeadingStyle}>
              4. Include the Certificate of Authenticity
            </Text>
            <Text className="text-muted" style={stepTextStyle}>
              Attach the Certificate of Authenticity securely to the package
              exterior or hand it directly to the courier at the time of pickup.
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
            Shipments without proper external documentation may be refused by
            the courier or heavily delayed at borders. Thank you for your
            meticulous attention to detail.
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

// Shared styles
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
  fontSize: "16px",
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
