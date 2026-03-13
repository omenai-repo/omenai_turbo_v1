import { base_url } from "@omenai/url-config/src/config";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
  Heading,
} from "@react-email/components";
import { ArtworkSchemaTypes } from "@omenai/shared-types";
import EmailFooter from "../../components/Footer";
import EmailArtworkCard from "../components/EmailArtworkCard";
import { COMPANY_INFO } from "../../constants/constants";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";
import * as React from "react";

interface RequestPriceEmailProps {
  name: string;
  artwork_data: Pick<
    ArtworkSchemaTypes,
    "title" | "artist" | "art_id" | "pricing" | "url" | "medium"
  >;
}

export const RequestPriceEmail = ({
  name,
  artwork_data,
}: RequestPriceEmailProps) => {
  const artworkUrl = `${base_url()}/artwork/${artwork_data.art_id}`;
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
              .link-main { color: #60a5fa !important; }
            }
          `}
        </style>
      </Head>
      <Preview>
        Private Price Inquiry information for {artwork_data.title}
      </Preview>
      <Tailwind>
        <Body
          className="body-bg bg-gray-50 font-sans"
          style={{ margin: "0", padding: "0" }}
        >
          <Container
            className="container-bg bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
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
              Private Price Inquiry Response
            </Heading>

            <Text className="text-main text-gray-800" style={textStyle}>
              Dear <strong>{name}</strong>,
            </Text>

            <Text className="text-main text-gray-800" style={textStyle}>
              Thank you for your interest in{" "}
              <Link
                href={artworkUrl}
                className="link-main italic"
                style={{
                  color: "#2563eb",
                  textDecoration: "none",
                  fontWeight: "500",
                  fontStyle: "italic",
                }}
              >
                {artwork_data.title}
              </Link>
              . Below are the pricing details you requested.
            </Text>

            <EmailArtworkCard
              artwork={artwork_data.title}
              artistName={artwork_data.artist}
              price={formatPrice(artwork_data.pricing.usd_price)}
              artworkImage={optimizedImage}
            />

            {/* Technical Specifications Box */}
            <Section className="bg-box bg-gray-50 rounded-lg p-6 my-8 border border-gray-100 border-divider">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td
                      style={{ width: "100px", paddingBottom: "4px" }}
                      className="text-muted text-gray-500 text-sm"
                    >
                      Medium:
                    </td>
                    <td
                      style={{ paddingBottom: "4px" }}
                      className="text-main text-gray-900 text-sm font-medium"
                    >
                      {artwork_data.medium}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted text-gray-500 text-sm">
                      Artist:
                    </td>
                    <td className="text-main text-gray-900 text-sm font-medium">
                      {artwork_data.artist}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Section style={{ textAlign: "center", margin: "32px 0" }}>
              <Button
                href={`${base_url()}/purchase/${encodeURIComponent(artwork_data.art_id)}`}
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
                Initiate Purchase
              </Button>
            </Section>

            {/* Muted Advisory Notice */}
            <Section style={{ margin: "24px 0" }}>
              <Text
                className="text-muted text-gray-500"
                style={{
                  fontSize: "13px",
                  lineHeight: "1.6",
                  fontStyle: "italic",
                  margin: "0",
                }}
              >
                <strong>Note:</strong> The price shown reflects the base price
                of the artwork. Final costs, including white glove shipping,
                insurance, and applicable regional taxes, will be calculated
                during the checkout process.
              </Text>
            </Section>

            <Text className="text-main text-gray-800" style={textStyle}>
              Should you require additional details regarding the artist&apos;s
              province or high resolution documentation of the piece, our
              advisory team is available to assist.
            </Text>

            <Text
              className="text-main text-gray-800"
              style={{ ...textStyle, marginTop: "32px" }}
            >
              Warmly,
              <br />
              <span
                className="text-muted text-gray-500"
                style={{ fontSize: "14px" }}
              >
                The Omenai Team
              </span>
            </Text>

            <Hr
              className="border-divider border-gray-200"
              style={{ margin: "32px 0" }}
            />

            <EmailFooter
              recipientName={name}
              showSupportSection={true}
              supportTitle="Questions about this work?"
              supportMessage="Connect with our advisory team for details, provenance, and documentation."
            />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

const textStyle = {
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

export default RequestPriceEmail;
