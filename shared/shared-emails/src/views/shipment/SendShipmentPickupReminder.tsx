import { AddressTypes, ArtworkSchemaTypes } from "@omenai/shared-types";
import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
  Button,
} from "@react-email/components";
import * as React from "react";
import EmailFooter from "../../components/Footer";
import {
  EMAIL_STYLES,
  COMPANY_INFO,
  EMAIL_COLORS,
  EMAIL_SIGNATURES,
} from "../../constants/constants";

interface ShipmentPickupNotificationEmailProps {
  galleryName: string;
  artwork: Pick<ArtworkSchemaTypes, "title" | "artist" | "art_id">;
  orderId: string;
  buyerName: string;
  pickupAddress: AddressTypes;
  estimatedPickupDate?: string;
  daysLeft: string;
}

export const ShipmentPickupNotificationEmail: React.FC<
  ShipmentPickupNotificationEmailProps
> = ({
  galleryName,
  artwork,
  orderId,
  buyerName,
  pickupAddress,
  daysLeft,
  estimatedPickupDate = `In the next ${daysLeft} day(s)`,
}) => {
  return (
    <Html>
      <Head />
      <Preview>
        Action Required: Prepare {artwork.title} for courier pickup
      </Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container
            style={EMAIL_STYLES.container}
            className="my-10 rounded-lg shadow-sm"
          >
            {/* Header Section */}
            <Section className="px-8 py-6 text-center border-b border-gray-200">
              <Img
                src={COMPANY_INFO.logo}
                width="140"
                height="24"
                alt={`${COMPANY_INFO.name} logo`}
                className="mx-auto"
              />
            </Section>

            {/* Urgent Banner */}
            <Section className="bg-amber-50 px-8 py-4 border-b-4 border-amber-400">
              <Text
                className="text-center font-semibold m-0"
                style={{ color: EMAIL_COLORS.warning, fontSize: "18px" }}
              >
                📦 Shipment Pickup Schedule Reminder - Action Required
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="px-8 py-8">
              <Text style={EMAIL_STYLES.text.base}>
                Dear <strong>{galleryName}</strong> Team,
              </Text>

              <Text style={EMAIL_STYLES.text.base}>
                We're writing to inform you that a shipment request for the
                following artwork will be created within the next {daysLeft}{" "}
                day(s). A courier will be scheduled to collect the piece from
                your gallery address.
              </Text>

              {/* Order Details */}
              <Section className="my-8 p-6 bg-gray-50 rounded-lg">
                <Text
                  style={{ ...EMAIL_STYLES.heading.h2, marginBottom: "16px" }}
                >
                  Shipment Details
                </Text>

                <table
                  className="w-full"
                  style={{
                    borderCollapse: "separate",
                    borderSpacing: "0 12px",
                  }}
                >
                  <tr>
                    <td
                      style={{
                        paddingRight: "16px",
                        verticalAlign: "top",
                        width: "140px",
                      }}
                    >
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          fontWeight: "600",
                          color: EMAIL_COLORS.gray[600],
                        }}
                      >
                        Order ID:
                      </Text>
                    </td>
                    <td>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          color: EMAIL_COLORS.primary,
                        }}
                      >
                        {orderId}
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingRight: "16px", verticalAlign: "top" }}>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          fontWeight: "600",
                          color: EMAIL_COLORS.gray[600],
                        }}
                      >
                        Artwork:
                      </Text>
                    </td>
                    <td>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          color: EMAIL_COLORS.primary,
                        }}
                      >
                        <strong>{artwork.title}</strong> by {artwork.artist}
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingRight: "16px", verticalAlign: "top" }}>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          fontWeight: "600",
                          color: EMAIL_COLORS.gray[600],
                        }}
                      >
                        Buyer:
                      </Text>
                    </td>
                    <td>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          color: EMAIL_COLORS.primary,
                        }}
                      >
                        {buyerName}
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingRight: "16px", verticalAlign: "top" }}>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          fontWeight: "600",
                          color: EMAIL_COLORS.gray[600],
                        }}
                      >
                        Pickup Location:
                      </Text>
                    </td>
                    <td>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          color: EMAIL_COLORS.primary,
                          lineHeight: "1.5",
                        }}
                      >
                        {pickupAddress.address_line}
                        <br />
                        {pickupAddress.city}, {pickupAddress.state}{" "}
                        {pickupAddress.zip}
                        <br />
                        {pickupAddress.country}
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        paddingRight: "16px",
                        paddingTop: "8px",
                        verticalAlign: "top",
                      }}
                    >
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          fontWeight: "600",
                          color: EMAIL_COLORS.warning,
                        }}
                      >
                        Pickup Timeline:
                      </Text>
                    </td>
                    <td style={{ paddingTop: "8px" }}>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          fontWeight: "600",
                          color: EMAIL_COLORS.warning,
                        }}
                      >
                        {estimatedPickupDate}
                      </Text>
                    </td>
                  </tr>
                </table>
              </Section>

              {/* Preparation Checklist */}
              <Section className="my-8 p-6 bg-blue-50 rounded-lg">
                <Text
                  style={{
                    ...EMAIL_STYLES.text.base,
                    marginBottom: "16px",
                    fontWeight: "600",
                  }}
                >
                  ✅ Required Preparation Checklist:
                </Text>

                <table style={{ width: "100%" }}>
                  <tr>
                    <td
                      style={{
                        paddingBottom: "12px",
                        verticalAlign: "top",
                        width: "30px",
                      }}
                    >
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          color: EMAIL_COLORS.success,
                        }}
                      >
                        □
                      </Text>
                    </td>
                    <td style={{ paddingBottom: "12px" }}>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          color: EMAIL_COLORS.primary,
                        }}
                      >
                        <strong>Professional Packaging:</strong> Wrap artwork
                        securely with appropriate protective materials (bubble
                        wrap, corner protectors, etc.)
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: "12px", verticalAlign: "top" }}>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          color: EMAIL_COLORS.success,
                        }}
                      >
                        □
                      </Text>
                    </td>
                    <td style={{ paddingBottom: "12px" }}>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          color: EMAIL_COLORS.primary,
                        }}
                      >
                        <strong>Outer Crating:</strong> Place in sturdy wooden
                        crate or heavy-duty cardboard box suitable for artwork
                        transportation
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: "12px", verticalAlign: "top" }}>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          color: EMAIL_COLORS.success,
                        }}
                      >
                        □
                      </Text>
                    </td>
                    <td style={{ paddingBottom: "12px" }}>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          color: EMAIL_COLORS.primary,
                        }}
                      >
                        <strong>Documentation:</strong> Attach invoice, packing
                        list, and certificate of authenticity in waterproof
                        envelope to the outside of package
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: "12px", verticalAlign: "top" }}>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          color: EMAIL_COLORS.success,
                        }}
                      >
                        □
                      </Text>
                    </td>
                    <td style={{ paddingBottom: "12px" }}>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          color: EMAIL_COLORS.primary,
                        }}
                      >
                        <strong>Labeling:</strong> Clearly mark package with
                        "FRAGILE - ARTWORK" and handling instructions on all
                        sides
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top" }}>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          color: EMAIL_COLORS.success,
                        }}
                      >
                        □
                      </Text>
                    </td>
                    <td>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          color: EMAIL_COLORS.primary,
                        }}
                      >
                        <strong>Photos:</strong> Take photos of the packaged
                        artwork before pickup for your records
                      </Text>
                    </td>
                  </tr>
                </table>
              </Section>

              {/* Important Notice */}
              <Section className="my-6 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                <Text
                  style={{
                    ...EMAIL_STYLES.text.small,
                    marginBottom: "8px",
                    color: EMAIL_COLORS.warning,
                  }}
                >
                  <strong>⚠️ Important:</strong>
                </Text>
                <Text
                  style={{
                    ...EMAIL_STYLES.text.small,
                    margin: "0",
                    color: EMAIL_COLORS.warning,
                  }}
                >
                  • The courier will only wait 15 minutes during pickup window
                  <br />
                  • Ensure someone is available to hand over the package
                  <br />
                  • Keep the artwork in a secure, easily accessible location
                  <br />• You will receive tracking information once the
                  shipment is collected
                </Text>
              </Section>

              <Text style={EMAIL_STYLES.text.base}>
                We will send you a confirmation email with the exact pickup date
                and time window once the shipment request is finalized. Please
                ensure the artwork is ready for collection by then.
              </Text>

              <Text style={EMAIL_STYLES.text.base}>
                Thank you for your prompt attention to this matter. Your
                cooperation ensures a smooth delivery experience for our valued
                collectors.
              </Text>

              <Text style={EMAIL_STYLES.text.base}>
                Best regards,
                <br />
                <strong>
                  {EMAIL_SIGNATURES.default.name}
                  <br />
                  Logistics Team, {EMAIL_SIGNATURES.default.company}
                </strong>
              </Text>
            </Section>

            {/* Reusable Footer */}
            <EmailFooter
              recipientName={galleryName}
              supportTitle="Need shipping assistance?"
              supportMessage="Our logistics team is available to help with packaging questions or special requirements. Contact us at"
            />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ShipmentPickupNotificationEmail;
