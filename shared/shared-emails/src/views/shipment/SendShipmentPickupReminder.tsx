import { AddressTypes, ArtworkSchemaTypes } from "@omenai/shared-types";
import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";
import EmailFooter from "../../components/Footer";
import { COMPANY_INFO } from "../../constants/constants";
import EmailArtworkCard from "../components/EmailArtworkCard";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";

interface ShipmentPickupNotificationEmailProps {
  galleryName: string;
  artwork: Pick<ArtworkSchemaTypes, "title" | "artist" | "art_id">;
  orderId: string;
  buyerName: string;
  pickupAddress: AddressTypes;
  estimatedPickupDate?: string;
  daysLeft: string;
  artworkImage: string;
  artistName: string;
  price: string;
  email?: string;
}

export const ShipmentPickupNotificationEmail = ({
  galleryName,
  artwork,
  orderId,
  buyerName,
  pickupAddress,
  daysLeft,
  estimatedPickupDate = `Within ${daysLeft} day(s)`,
  artworkImage,
  artistName,
  price,
}: ShipmentPickupNotificationEmailProps) => {
  const optimizedImage = getImageFileView(artworkImage, 400);

  return (
    <Html>
      <Head>
        <style>
          {`
            @media (prefers-color-scheme: dark) {
              .body-bg { background-color: #0f172a !important; }
              .container-bg { background-color: #000000 !important; border: 1px solid #1f2937 !important; }
              .text-main { color: #e5e7eb !important; }
              .text-muted { color: #9ca3af !important; }
              .heading-main { color: #ffffff !important; }
              .bg-box { background-color: #1f2937 !important; border-color: #374151 !important; }
              .border-divider { border-color: #374151 !important; }
              .advisory-box { background-color: #3f3f46 !important; border-left-color: #d4d4d8 !important; }
            }
          `}
        </style>
      </Head>
      <Preview>
        Dispatch Advisory: Prepare {artwork.title} for scheduled courier pickup.
      </Preview>
      <Tailwind>
        <Body
          className="body-bg font-sans bg-gray-50"
          style={{ margin: "0", padding: "0" }}
        >
          <Container
            className="container-bg bg-white my-10 rounded -lg shadow-sm border border-gray-200 overflow-hidden"
            style={{ maxWidth: "600px" }}
          >
            {/* Header Section */}
            <Section className="px-8 py-8 text-center border-b border-gray-100 border-divider">
              <Img
                src={COMPANY_INFO.logo}
                width="140"
                height="24"
                alt={`${COMPANY_INFO.name} logo`}
                className="mx-auto"
              />
            </Section>

            {/* Elevated Advisory Banner */}
            <Section className="bg-box bg-gray-50 px-8 py-5 border-b border-gray-200 border-divider">
              <Text
                className="heading-main text-center m-0 text-gray-900"
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Logistics Dispatch Advisory
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="px-8 py-8">
              <Text className="text-main text-gray-800" style={textStyle}>
                Dear <strong>{galleryName}</strong>,
              </Text>

              <Text className="text-main text-gray-800" style={textStyle}>
                A logistics dispatch has been initiated for your recent sale. A
                designated premium courier will arrive at your gallery within
                the next <strong>{daysLeft} day(s)</strong> to securely collect
                the piece.
              </Text>

              <EmailArtworkCard
                artwork={artwork.title}
                artworkImage={optimizedImage}
                artistName={artistName}
                price={price}
              />

              {/* Order Details Grid */}
              <Section className="bg-box bg-gray-50 rounded -lg p-6 my-8 border border-gray-200 border-divider">
                <Text
                  className="heading-main text-gray-900"
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    marginBottom: "20px",
                  }}
                >
                  Dispatch Manifest
                </Text>

                <table
                  className="w-full"
                  style={{ borderCollapse: "collapse" }}
                >
                  <tbody>
                    <tr style={rowStyle}>
                      <td
                        style={labelCell}
                        className="text-muted text-gray-500"
                      >
                        Reference ID:
                      </td>
                      <td
                        style={valueCell}
                        className="text-main text-gray-900 font-medium"
                      >
                        {orderId}
                      </td>
                    </tr>
                    <tr style={rowStyle}>
                      <td
                        style={labelCell}
                        className="text-muted text-gray-500"
                      >
                        Collector:
                      </td>
                      <td style={valueCell} className="text-main text-gray-900">
                        {buyerName}
                      </td>
                    </tr>
                    <tr style={rowStyle}>
                      <td
                        style={labelCell}
                        className="text-muted text-gray-500"
                      >
                        Collection Point:
                      </td>
                      <td
                        style={valueCell}
                        className="text-main text-gray-900 leading-relaxed"
                      >
                        {pickupAddress.address_line}
                        <br />
                        {pickupAddress.city}, {pickupAddress.state}{" "}
                        {pickupAddress.zip}
                        <br />
                        {pickupAddress.country}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{ ...labelCell, paddingTop: "12px" }}
                        className="text-muted text-gray-500"
                      >
                        Est. Arrival:
                      </td>
                      <td
                        style={{ ...valueCell, paddingTop: "12px" }}
                        className="text-main text-gray-900 font-semibold"
                      >
                        {estimatedPickupDate}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Section>

              {/* Preparation Checklist */}
              <Text
                className="heading-main text-gray-900"
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  marginTop: "32px",
                  marginBottom: "16px",
                }}
              >
                Mandatory Preparation Protocol
              </Text>

              <Section className="mb-8">
                <Text
                  className="text-main text-gray-800"
                  style={{ ...textStyle, marginBottom: "24px" }}
                >
                  To prevent collection refusal or transit damage, the artwork
                  must be prepared prior to the courier's arrival:
                </Text>

                <div className="bg-box bg-white border border-gray-200 border-divider rounded -md p-4 mb-3">
                  <Text
                    className="heading-main text-gray-900 font-semibold m-0 mb-1"
                    style={{ fontSize: "15px" }}
                  >
                    1. Professional Padding
                  </Text>
                  <Text
                    className="text-muted text-gray-600 m-0"
                    style={{ fontSize: "14px", lineHeight: "1.5" }}
                  >
                    Wrap the artwork securely with acid-free materials, bubble
                    wrap, and structural corner protectors.
                  </Text>
                </div>

                <div className="bg-box bg-white border border-gray-200 border-divider rounded -md p-4 mb-3">
                  <Text
                    className="heading-main text-gray-900 font-semibold m-0 mb-1"
                    style={{ fontSize: "15px" }}
                  >
                    2. Outer Packing
                  </Text>
                  <Text
                    className="text-muted text-gray-600 m-0 mb-3"
                    style={{ fontSize: "14px", lineHeight: "1.5" }}
                  >
                    Place the padded piece in a heavy-duty double-walled
                    cardboard box or tube suitable for international transit.
                  </Text>
                </div>

                <div className="bg-box bg-white border border-gray-200 border-divider rounded -md p-4 mb-3">
                  <Text
                    className="heading-main text-gray-900 font-semibold m-0 mb-1"
                    style={{ fontSize: "15px" }}
                  >
                    3. External Documentation
                  </Text>
                  <Text
                    className="text-muted text-gray-600 m-0"
                    style={{ fontSize: "14px", lineHeight: "1.5" }}
                  >
                    Attach the commercial invoice, packing list, and Certificate
                    of Authenticity in a clear, waterproof pouch on the package
                    exterior.
                  </Text>
                </div>
              </Section>

              {/* Standard Operating Procedure Notice */}
              <Section className="advisory-box bg-gray-100 rounded -r-lg p-5 border-l-4 border-gray-800 my-8">
                <Text
                  className="heading-main text-gray-900 font-semibold m-0 mb-2"
                  style={{ fontSize: "15px" }}
                >
                  Standard Courier Protocol
                </Text>
                <Text
                  className="text-main text-gray-700 m-0"
                  style={{ fontSize: "14px", lineHeight: "1.6" }}
                >
                  • Couriers are strictly allotted a 15-minute wait window upon
                  arrival.
                  <br />
                  • An authorized representative must be present to hand over
                  the manifest and package.
                  <br />• Your tracking dashboard will update automatically once
                  the piece is scanned at collection.
                </Text>
              </Section>

              <Hr
                className="border-divider border-gray-200"
                style={{ margin: "32px 0" }}
              />

              <Text
                className="text-muted text-gray-600"
                style={{ fontSize: "14px", lineHeight: "1.6" }}
              >
                We will send a final confirmation email specifying the exact
                pickup time window once scheduling is finalized with the
                carrier.
                <br />
                Warmly,
                <br />
                <strong className="heading-main text-gray-900">
                  Omenai Logistics Team
                </strong>
              </Text>
            </Section>

            {/* Reusable Footer */}
            <EmailFooter
              recipientName={galleryName}
              supportTitle="Require logistics assistance?"
              supportMessage="Our advisory team is available to help with crating guidelines or customs requirements. Contact us at"
            />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

// Shared Styles
const textStyle = {
  fontSize: "16px",
  lineHeight: "1.6",
  marginBottom: "16px",
};

const labelCell = {
  width: "130px",
  paddingBottom: "12px",
  fontSize: "14px",
  verticalAlign: "top",
};

const valueCell = {
  paddingBottom: "12px",
  fontSize: "15px",
  verticalAlign: "top",
};
const rowStyle = {
  borderBottom: "1px solid #f3f4f6",
};

export default ShipmentPickupNotificationEmail;
