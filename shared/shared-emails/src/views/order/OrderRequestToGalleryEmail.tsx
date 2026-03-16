import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { base_url, dashboard_url } from "@omenai/url-config/src/config";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";
import EmailFooter from "../../components/Footer";
import EmailArtworkCard from "../components/EmailArtworkCard";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";
import { COMPANY_INFO } from "../../constants/constants";

interface OrderRequestToGalleryMailProps {
  name: string;
  buyer: string;
  date: string;
  artwork_data: Pick<
    ArtworkSchemaTypes,
    "title" | "artist" | "art_id" | "pricing" | "url"
  >;
  email?: string;
}

export const OrderRequestToGalleryMail = ({
  name,
  buyer,
  date,
  artwork_data,
}: OrderRequestToGalleryMailProps) => {
  const url = base_url();
  const dashboard_uri = dashboard_url();
  const optimizedImage = getImageFileView(artwork_data.url, 400);

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
              .btn-main { background-color: #ffffff !important; color: #000000 !important; }
              .bg-box { background-color: #111827 !important; border-color: #374151 !important; }
              .border-divider { border-color: #374151 !important; }
              .advisory-box { background-color: #1f2937 !important; border-left-color: #3b82f6 !important; }
            }
          `}
        </style>
      </Head>
      <Preview>
        New Acquisition Inquiry: A collector is interested in{" "}
        {artwork_data.title}.
      </Preview>
      <Tailwind>
        <Body
          className="body-bg bg-gray-50 font-sans"
          style={{ margin: "0", padding: "0" }}
        >
          <Container
            className="container-bg bg-white rounded -lg shadow-sm border border-gray-200 overflow-hidden"
            style={{ maxWidth: "600px", margin: "40px auto", padding: "24px" }}
          >
            <Heading
              className="heading-main text-gray-900"
              style={{
                fontSize: "22px",
                fontWeight: "600",
                letterSpacing: "-0.5px",
                margin: "0 0 24px 0",
              }}
            >
              New Order request
            </Heading>

            <Text className="text-main text-gray-800" style={textStyle}>
              Hello <strong>{name}</strong>,
            </Text>

            <Text className="text-main text-gray-800" style={textStyle}>
              We are pleased to inform you that a collector has expressed formal
              interest in acquiring a piece from your listings on Omenai.
            </Text>

            <EmailArtworkCard
              artwork={artwork_data.title}
              artistName={artwork_data.artist}
              price={`$${artwork_data.pricing.price.toLocaleString()}`}
              artworkImage={optimizedImage}
            />

            {/* Acquisition Manifest */}
            <Section className="bg-box bg-gray-50 rounded -lg p-6 my-8 border border-gray-100 border-divider">
              <Text
                className="heading-main text-gray-900"
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "16px",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                Order Manifest
              </Text>

              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={labelCell} className="text-muted text-gray-500">
                      Interested Buyer:
                    </td>
                    <td
                      style={valueCell}
                      className="text-main text-gray-900 font-medium"
                    >
                      {buyer}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        ...labelCell,
                        paddingTop: "12px",
                        borderBottom: "none",
                      }}
                      className="text-muted text-gray-500"
                    >
                      Received Date:
                    </td>
                    <td
                      style={{
                        ...valueCell,
                        paddingTop: "12px",
                        borderBottom: "none",
                      }}
                      className="text-main text-gray-900"
                    >
                      {date}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Section style={{ textAlign: "center", margin: "32px 0" }}>
              <Button
                href={`${dashboard_uri}/gallery/orders`}
                className="btn-main"
                style={{
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: "500",
                  padding: "16px 36px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  display: "inline-block",
                  letterSpacing: "0.3px",
                }}
              >
                Review Full Details
              </Button>
            </Section>

            {/* Response Timeline Advisory */}
            <Section className="advisory-box bg-blue-50 rounded -r-lg p-5 border-l-4 border-blue-600 mb-8">
              <Text
                className="text-main text-gray-800 m-0"
                style={{ fontSize: "14px", lineHeight: "1.6" }}
              >
                <strong
                  className="heading-main text-gray-900"
                  style={{ fontWeight: "600" }}
                >
                  Note:
                </strong>{" "}
                To maintain a premium collector experience, we recommend
                responding with confirmation within 48 hours.
              </Text>
            </Section>

            <Text className="text-main text-gray-800" style={textStyle}>
              Our team is available to assist you with any logistical questions
              or special handling requirements for this potential placement.
            </Text>

            <Text
              className="text-main text-gray-800"
              style={{ ...textStyle, marginTop: "32px" }}
            >
              Warmly,
              <br />
              <br />
              <span
                className="text-muted text-gray-500"
                style={{ fontSize: "14px" }}
              >
                The Omenai Team,
              </span>
            </Text>

            <Hr
              className="border-divider border-gray-200"
              style={{ margin: "32px 0" }}
            />

            <EmailFooter
              recipientName={name}
              showSupportSection={true}
              supportTitle="Require assistance?"
              supportMessage="Our gallery support team is ready to help you finalize this sale. Reach out at"
            />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

// Shared Styles
const textStyle = {
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

const labelCell = {
  width: "140px",
  paddingBottom: "12px",
  fontSize: "13px",
  verticalAlign: "top",
};

const valueCell = {
  paddingBottom: "12px",
  fontSize: "14px",
  verticalAlign: "top",
};

export default OrderRequestToGalleryMail;
