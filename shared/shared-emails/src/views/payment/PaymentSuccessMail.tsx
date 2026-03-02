import { base_url } from "@omenai/url-config/src/config";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Img,
  Link,
  Tailwind,
  Button,
} from "@react-email/components";
import * as React from "react";
import EmailFooter from "../../components/Footer";
import EmailArtworkCard from "../components/EmailArtworkCard";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";
import { COMPANY_INFO } from "../../constants/constants";

interface PurchaseConfirmationEmailProps {
  name: string;
  artwork: string;
  artistName: string;
  artworkImage: string;
  amount: string;
  transaction_id: string;
  order_date: string;
  order_id: string;
}

export const PurchaseConfirmationEmail = ({
  name,
  artwork,
  artistName,
  artworkImage,
  amount,
  transaction_id,
  order_date,
  order_id,
}: PurchaseConfirmationEmailProps) => {
  const optimizedImage = getImageFileView(artworkImage, 400);
  const dashboardUrl = `${base_url()}/dashboard/user/orders`;

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
              .link-main { color: #60a5fa !important; }
            }
          `}
        </style>
      </Head>
      <Preview>Payment Confirmed. Thank you for your purchase</Preview>
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
                textAlign: "center",
              }}
            >
              Payment Confirmed. Thank you for your purchase
            </Heading>

            <Text className="text-main text-gray-800" style={textStyle}>
              Dear <strong>{name}</strong>,
            </Text>

            <Text className="text-main text-gray-800" style={textStyle}>
              We&apos;re preparing your artwork for shipment and will share
              tracking details as soon as the shipment is created.
            </Text>

            <EmailArtworkCard
              artwork={artwork}
              artistName={artistName}
              price={amount}
              artworkImage={optimizedImage}
            />

            {/* Bulletproof Transaction Receipt */}
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
                Order Details
              </Text>

              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={labelCell} className="text-muted text-gray-500">
                      Order ID:
                    </td>
                    <td
                      style={valueCell}
                      className="text-main text-gray-900 font-mono"
                    >
                      #{order_id}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td
                      style={{ ...labelCell, paddingTop: "12px" }}
                      className="text-muted text-gray-500"
                    >
                      Transaction ID:
                    </td>
                    <td
                      style={{ ...valueCell, paddingTop: "12px" }}
                      className="text-main text-gray-900 font-mono"
                    >
                      {transaction_id}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td
                      style={{ ...labelCell, paddingTop: "12px" }}
                      className="text-muted text-gray-500"
                    >
                      Date:
                    </td>
                    <td
                      style={{ ...valueCell, paddingTop: "12px" }}
                      className="text-main text-gray-900"
                    >
                      {order_date}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        ...labelCell,
                        paddingTop: "12px",
                        borderBottom: "none",
                      }}
                      className="text-main text-gray-900 font-semibold"
                    >
                      Total Settled:
                    </td>
                    <td
                      style={{
                        ...valueCell,
                        paddingTop: "12px",
                        borderBottom: "none",
                      }}
                      className="text-main text-gray-900 font-bold"
                    >
                      {amount}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Text className="text-main text-gray-800" style={textStyle}>
              You can track your order anytime in your{" "}
              <strong> Account Dashboard.</strong>
            </Text>

            <Text
              className="text-main text-gray-800"
              style={{ ...textStyle, marginTop: "32px" }}
            >
              <br />
              Warm regards,
              <br />
              <span
                className="text-muted text-gray-500"
                style={{ fontSize: "14px" }}
              >
                Omenai Advisory
              </span>
            </Text>

            <Hr
              className="border-divider border-gray-200"
              style={{ margin: "32px 0" }}
            />
            <Text>
              Questions about this work? Connect with our advisory team for
              details and documentation at
              <Link
                className="link-main italic"
                style={{
                  color: "#2563eb",
                  textDecoration: "none",
                  fontWeight: "500",
                }}
                href="mailto:info@omenai.app"
              >
                info@omenai.app
              </Link>
            </Text>

            <Hr
              className="border-divider border-gray-200"
              style={{ margin: "32px 0" }}
            />

            <EmailFooter
              recipientName={name}
              showSupportSection={true}
              supportTitle="Questions about this work?"
              supportMessage="Connect with our advisory team for details and documentation"
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
  paddingBottom: "12px",
  fontSize: "14px",
  verticalAlign: "top",
  width: "140px",
};

const valueCell = {
  paddingBottom: "12px",
  fontSize: "14px",
  verticalAlign: "top",
  textAlign: "right" as const,
};

export default PurchaseConfirmationEmail;
