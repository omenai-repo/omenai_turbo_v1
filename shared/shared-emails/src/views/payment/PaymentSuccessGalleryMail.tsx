import { dashboard_url } from "@omenai/url-config/src/config";
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

interface PaymentSuccessfulGalleryMailProps {
  name: string;
  artwork: string;
  artistName: string;
  price: string;
  artworkImage: string;
  order_id: string;
  order_date: string;
  transaction_id: string;
}

export const PaymentSuccessfulGalleryMail = ({
  name,
  artwork,
  artistName,
  price,
  artworkImage,
  order_id,
  order_date,
  transaction_id,
}: PaymentSuccessfulGalleryMailProps) => {
  const url = dashboard_url();
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
              .btn-main { background-color: #ffffff !important; color: #000000 !important; }
              .bg-box { background-color: #111827 !important; border-color: #374151 !important; }
              .border-divider { border-color: #374151 !important; }
            }
          `}
        </style>
      </Head>
      <Preview>
        Sale Confirmed: Payment for {artwork} has been successfully processed.
      </Preview>
      <Tailwind>
        <Body
          className="body-bg bg-gray-50 font-sans"
          style={{ margin: "0", padding: "0" }}
        >
          <Container
            className="container-bg bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            style={{ maxWidth: "600px", margin: "40px auto", padding: "32px" }}
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
              Sale Confirmed: Payment completed for {artwork}
            </Heading>

            <Text className="text-main text-gray-800" style={textStyle}>
              Hello <strong>{name}</strong>,
            </Text>

            <Text className="text-main text-gray-800" style={textStyle}>
              Congratulations! We are thrilled to confirm that the collector's
              payment for your artwork has been successfully processed. The
              acquisition is now officially complete.
            </Text>

            <EmailArtworkCard
              artwork={artwork}
              artistName={artistName}
              price={price}
              artworkImage={optimizedImage}
            />

            {/* Financial & Fulfillment Protocol */}
            <Section className="bg-box bg-gray-50 rounded-lg p-6 my-8 border border-gray-100 border-divider">
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
                Fulfillment Protocol
              </Text>

              <table
                className="w-full mb-4"
                style={{ borderCollapse: "collapse" }}
              >
                <tbody>
                  <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={labelCell} className="text-muted text-gray-500">
                      Order ID:
                    </td>
                    <td
                      style={valueCell}
                      className="text-main text-gray-900 font-medium"
                    >
                      #{order_id}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td
                      style={{ ...labelCell, paddingTop: "12px" }}
                      className="text-muted text-gray-500"
                    >
                      Transaction ID:
                    </td>
                    <td
                      style={{ ...valueCell, paddingTop: "12px" }}
                      className="text-main text-gray-900"
                    >
                      {transaction_id}
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
                      Date paid:
                    </td>
                    <td
                      style={{
                        ...valueCell,
                        paddingTop: "12px",
                        borderBottom: "none",
                      }}
                      className="text-main text-gray-900"
                    >
                      {order_date}
                    </td>
                  </tr>
                </tbody>
              </table>

              <Hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />

              <Text
                className="text-main text-gray-800"
                style={{
                  fontSize: "14px",
                  lineHeight: "1.6",
                  margin: "0 0 8px 0",
                }}
              >
                <strong>1. Payout Initiated:</strong> The funds have been
                deposited and are processing in your Stripe Connect account.
              </Text>
              <Text
                className="text-main text-gray-800"
                style={{ fontSize: "14px", lineHeight: "1.6", margin: "0" }}
              >
                <strong>2. Logistics Prep:</strong> Please begin safely
                packaging the artwork for pickup. If you need assistance with
                logistics, our team is here to help.
              </Text>
            </Section>

            <Section style={{ textAlign: "center", margin: "32px 0" }}>
              <Button
                href={`${url}/gallery/payouts`}
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
                View Payout Details
              </Button>
            </Section>

            <Text className="text-main text-gray-800" style={textStyle}>
              Thank you for trusting Omenai with your collection. We look
              forward to facilitating many more placements for your gallery.
            </Text>

            <Text
              className="text-main text-gray-800"
              style={{ ...textStyle, marginTop: "32px" }}
            >
              Warmly,
              <br />
              <br />
              <strong
                className="heading-main text-gray-900"
                style={{ fontWeight: "600" }}
              >
                Moses
              </strong>
              <br />
              <span
                className="text-muted text-gray-500"
                style={{ fontSize: "14px" }}
              >
                The Omenai team
              </span>
            </Text>

            <Hr
              className="border-divider border-gray-200"
              style={{ margin: "32px 0" }}
            />

            <EmailFooter
              recipientName={name}
              showSupportSection={true}
              supportTitle="Have fulfillment questions?"
              supportMessage="If you need assistance coordinating logistics or viewing your Stripe payouts, reach out at"
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
  width: "120px",
  paddingBottom: "12px",
  fontSize: "13px",
  verticalAlign: "top",
};

const valueCell = {
  paddingBottom: "12px",
  fontSize: "14px",
  verticalAlign: "top",
};

export default PaymentSuccessfulGalleryMail;
