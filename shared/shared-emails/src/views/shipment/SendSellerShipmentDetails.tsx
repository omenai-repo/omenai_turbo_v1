// components/emails/SellerShipmentEmail.tsx
import { Container, Section, Text, Heading } from "@react-email/components";
import EmailArtworkCard from "./EmailArtworkCard";
import ShipmentLayout from "./ShipmentLayout";
import {
  getImageFileView,
  getOptimizedImage,
} from "@omenai/shared-lib/storage/getImageFileView";

export default function SellerShipmentEmail(
  name: string,
  artwork: string,
  artworkImage: string,
  artistName: string,
  price: string,
) {
  const artworkImageUrl = getOptimizedImage(artworkImage, "small");
  return (
    <ShipmentLayout
      preview="Your shipment has been created and is ready for pickup"
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
            A shipment has been successfully created for your piece. Our courier
            partner will reach out shortly to schedule a pickup from your
            location.
          </Text>
          <EmailArtworkCard
            artwork={artwork}
            artworkImage={artworkImageUrl}
            artistName={artistName}
            price={price}
          />
          <Text
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              marginBottom: "16px",
            }}
          >
            Please carefully follow the instructions below to prepare your
            shipment:
          </Text>

          <Text
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              marginBottom: "12px",
            }}
          >
            <strong>1. Print All Attached Documents</strong>
            <br />
            This email includes your shipping documents in a single PDF file.
            Please print the entire document.
          </Text>

          <Text
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              marginBottom: "12px",
            }}
          >
            <strong>2. Attach the Shipping Label</strong>
            <br />
            The first page is the shipping label. Securely attach this to the
            outside of the package where it is clearly visible.
          </Text>

          <Text
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              marginBottom: "12px",
            }}
          >
            <strong>
              3. Attach the Commercial Invoice (Important for Customs)
            </strong>
            <br />
            Print three (3) copies of the commercial invoice and place them in a
            clear pouch on the outside of the package. DO NOT PLACE CUSTOMS
            DOCUMENTS INSIDE THE PACKAGE.
          </Text>

          <Text
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              marginBottom: "12px",
            }}
          >
            <strong>4. Include the Certificate of Authenticity</strong>
            <br />
            Attach the certificate of authenticity securely to the package or
            hand it directly to the courier at pickup.
          </Text>

          <Text
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              marginBottom: "16px",
            }}
          >
            Ensure the artwork is securely packaged and ready before the courier
            arrives. Shipments without proper documentation may be delayed.
          </Text>
          <Text style={{ marginTop: "40px", fontSize: "16px" }}>
            Best regards,
            <br />
            Omenai
          </Text>
        </Section>
      </Container>
    </ShipmentLayout>
  );
}
