import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
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
import { dashboard_url } from "@omenai/url-config/src/config";

interface PaymentSuccessMailArtistProps {
  name: string;
  artwork: string;
  artistName: string;
  artworkImage: string;
  amount: string | number;
  order_id: string;
  order_date: string;
  transaction_id: string;
}

export const PaymentSuccessMailArtist = ({
  name,
  artwork,
  artistName,
  artworkImage,
  amount,
  order_date,
  order_id,
  transaction_id,
}: PaymentSuccessMailArtistProps) => {
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
              .link-main { color: #60a5fa !important; }
            }
          `}
        </style>
      </Head>
      <Preview>
        Sale Confirmed: A collector has acquired {artwork}. View your next
        steps.
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
            {/* Header */}
            <Section style={{ textAlign: "center", marginBottom: "32px" }}>
              <Img
                src={COMPANY_INFO.logo}
                width="130"
                height="auto"
                alt="Omenai logo"
                style={{ margin: "0 auto" }}
              />
            </Section>

            <Heading
              className="heading-main text-gray-900"
              style={{
                fontSize: "22px",
                fontWeight: "600",
                letterSpacing: "-0.5px",
                margin: "0 0 24px 0",
              }}
            >
              Sale Confirmed: Artwork Acquired
            </Heading>

            <Text className="text-main text-gray-800" style={textStyle}>
              Hello <strong>{name}</strong>,
            </Text>

            <Text className="text-main text-gray-800" style={textStyle}>
              Congratulations! We are thrilled to inform you that a collector
              has successfully purchased your artwork. The transaction has been
              fully processed and secured.
            </Text>

            <EmailArtworkCard
              artwork={artwork}
              artistName={artistName || name}
              price={
                typeof amount === "string" && amount.includes("$")
                  ? amount
                  : formatPrice(Number(amount), "USD")
              }
              artworkImage={optimizedImage}
            />

            {/* Financial Details */}
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
                Transaction Summary
              </Text>

              <table
                className="w-full mb-6"
                style={{ borderCollapse: "collapse" }}
              >
                <tbody>
                  <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
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
                  <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td
                      style={{ ...labelCell, paddingTop: "12px" }}
                      className="text-muted text-gray-500"
                    >
                      Transaction:
                    </td>
                    <td
                      style={{ ...valueCell, paddingTop: "12px" }}
                      className="text-main text-gray-900 font-mono"
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
                      Date Secured:
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
                className="heading-main text-gray-900"
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                Fulfillment & Payment Protocol
              </Text>

              <Text
                className="text-main text-gray-800"
                style={{
                  fontSize: "14px",
                  lineHeight: "1.6",
                  margin: "0 0 12px 0",
                }}
              >
                <strong>1. Funds Secured:</strong> The payment has been safely
                processed and the funds are currently held in your{" "}
                <strong>pending wallet balance</strong>.
              </Text>
              <Text
                className="text-main text-gray-800"
                style={{
                  fontSize: "14px",
                  lineHeight: "1.6",
                  margin: "0 0 12px 0",
                }}
              >
                <strong>2. Logistics Preparation:</strong> Please begin
                carefully packaging the piece. A courier shipment will be
                created shortly, and you will receive a separate email
                containing your waybill and shipping instructions.
              </Text>
              <Text
                className="text-main text-gray-800"
                style={{ fontSize: "14px", lineHeight: "1.6", margin: "0" }}
              >
                <strong>3. Payout Release:</strong> Once the artwork is
                successfully delivered to the collector, your funds will be
                instantly unlocked and available for withdrawal.
              </Text>
            </Section>

            <Section style={{ textAlign: "center", margin: "32px 0" }}>
              <Button
                href={`${dashboard_url()}/dashboard/wallet`}
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
                View Pending Wallet Balance
              </Button>
            </Section>

            <Text className="text-main text-gray-800" style={textStyle}>
              Thank you for sharing your incredible talent on Omenai. We are
              honored to facilitate the connection between your work and
              collectors worldwide.
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
              supportTitle="Have questions about fulfillment?"
              supportMessage="Our logistics team is available to assist you with packaging guidelines and courier scheduling. Reach out at"
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

export default PaymentSuccessMailArtist;
