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
      <Preview>
        Acquisition Confirmed: Official receipt for your purchase of {artwork}.
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
                textAlign: "center",
              }}
            >
              Purchase Confirmed
            </Heading>

            <Text className="text-main text-gray-800" style={textStyle}>
              Dear <strong>{name}</strong>,
            </Text>

            <Text className="text-main text-gray-800" style={textStyle}>
              Congratulations on your artwork purchase. Your payment has been
              successfully processed, and preparations for shipping are
              underway. Below are the details of your transaction and next
              steps.
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
                Official Receipt
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
              <strong>What happens next:</strong> As soon as the securely
              packaged piece is handed over to the logistics courier, you will
              receive an update containing your tracking details and estimated
              delivery timeline.
            </Text>

            <Section style={{ textAlign: "center", margin: "32px 0" }}>
              <Button
                href={dashboardUrl}
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
                Track order Status
              </Button>
            </Section>

            <Text
              className="text-main text-gray-800"
              style={{ ...textStyle, marginTop: "32px" }}
            >
              Thank you for trusting Omenai to build your collection.
              <br />
              <br />
              Warm regards,
              <br />
              <span
                className="text-muted text-gray-500"
                style={{ fontSize: "14px" }}
              >
                Client Services, {COMPANY_INFO.name}
              </span>
            </Text>

            <Hr
              className="border-divider border-gray-200"
              style={{ margin: "32px 0" }}
            />

            <EmailFooter
              recipientName={name}
              showSupportSection={true}
              supportTitle="Have questions about delivery?"
              supportMessage="Our advisory team is available to assist you with logistics tracking or installation queries. Reach out at"
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
