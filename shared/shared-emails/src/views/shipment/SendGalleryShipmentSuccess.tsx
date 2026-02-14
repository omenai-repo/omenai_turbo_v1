import { Text, Heading, Link } from "@react-email/components";
import { dashboard_url } from "@omenai/url-config/src/config";
import ShipmentLayout from "./ShipmentLayout";
import EmailArtworkCard from "./EmailArtworkCard";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";

export default function SendGalleryShipmentSuccess(
  name: string,
  trackingCode: string,
  artwork: string,
  artworkImage: string,
  artistName: string,
  price: string,
) {
  artworkImage = getImageFileView(artworkImage, 400);
  return (
    <ShipmentLayout
      preview="Shipment delivery completed and verified successfully."
      name={name}
    >
      <Heading
        as="h2"
        style={{
          color: "#0f172a",
          fontSize: "24px",
          marginBottom: "20px",
        }}
      >
        Shipment Delivery Confirmed
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
        Great news! The shipment for your artwork has been successfully
        delivered and verified by the buyer.
      </Text>
      {trackingCode && (
        <Text
          style={{
            fontSize: "16px",
            lineHeight: "1.5",
            marginBottom: "16px",
          }}
        >
          <strong>Tracking Code :</strong> {trackingCode}
        </Text>
      )}
      <EmailArtworkCard
        artwork={artwork}
        artworkImage={artworkImage}
        artistName={artistName}
        price={price}
      />
      <Text
        style={{
          fontSize: "16px",
          lineHeight: "1.5",
          marginBottom: "24px",
        }}
      >
        The delivery has been confirmed and marked as complete in our system.
        You can view the full details of this transaction in your gallery
        dashboard.
      </Text>
      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <Link
          href={`${dashboard_url()}/gallery/orders`}
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
          View Dashboard
        </Link>
      </div>
      <Text
        style={{
          fontSize: "14px",
          lineHeight: "1.5",
          color: "#64748b",
          marginTop: "24px",
        }}
      >
        Thank you for being part of the Omenai community. We appreciate your
        commitment to delivering exceptional art experiences!
      </Text>
      <Text style={{ fontSize: "16px", lineHeight: "1.5" }}>
        Best regards, <br />
        <strong>Omenai</strong>
      </Text>
    </ShipmentLayout>
  );
}
