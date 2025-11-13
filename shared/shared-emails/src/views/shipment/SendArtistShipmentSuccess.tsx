import { Text, Heading, Link } from "@react-email/components";
import { dashboard_url } from "@omenai/url-config/src/config";
import ShipmentLayout from "./ShipmentLayout";

export default function SendArtistShipmentSuccess(
  trackingCode: string,
  name: string
) {
  return (
    <ShipmentLayout
      name={name}
      preview="Great news! Your artwork has been delivered and funds are available for
        withdrawal."
    >
      <Heading
        as="h2"
        style={{
          color: "#0f172a",
          fontSize: "24px",
          marginBottom: "20px",
        }}
      >
        Artwork Delivered Successfully!
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
        Congratulations! Your artwork has been successfully delivered to the
        buyer.
      </Text>
      <Text
        style={{
          fontSize: "16px",
          lineHeight: "1.5",
          marginBottom: "16px",
        }}
      >
        <strong>Tracking Code : </strong> {trackingCode}
      </Text>

      <Text
        style={{
          fontSize: "16px",
          lineHeight: "1.5",
          marginBottom: "24px",
        }}
      >
        Your earnings from this sale are now available in your account and ready
        to be withdrawn at any time.
      </Text>

      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <Link
          href={`${dashboard_url()}/artist/app/orders`}
          style={{
            display: "inline-block",
            backgroundColor: "#10b981",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "16px",
          }}
        >
          Withdraw Funds
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
        Thank you for being part of the Omenai community. We're thrilled to see
        your art finding new homes!
      </Text>
    </ShipmentLayout>
  );
}
