import { storage } from "@omenai/appwrite-config";
import { base_url, getApiUrl } from "@omenai/url-config/src/config";
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
} from "@react-email/components";
import { ArtworkSchemaTypes } from "@omenai/shared-types";
import EmailFooter from "../../components/Footer";
import {
  EMAIL_STYLES,
  COMPANY_INFO,
  EMAIL_COLORS,
  EMAIL_SIGNATURES,
} from "../../constants/constants";

const RequestPriceEmail = (
  name: string,
  artwork_data: Pick<
    ArtworkSchemaTypes,
    "title" | "artist" | "art_id" | "pricing" | "url" | "medium"
  >
) => {
  const url = base_url();
  const image = storage.getFileView(
    process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
    artwork_data.url
  );
  return (
    <Html>
      <Head />
      <Preview>Price information for {artwork_data.title}</Preview>
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

            {/* Main Content */}
            <Section className="px-8 py-8">
              <Text style={EMAIL_STYLES.heading.h1}>
                Artwork Price Information
              </Text>

              <Text style={EMAIL_STYLES.text.base}>
                Dear <strong>{name}</strong>,
              </Text>

              <Text style={EMAIL_STYLES.text.base}>
                Thank you for your interest in{" "}
                <Link
                  href={`${base_url()}/artwork/${artwork_data.title}`}
                  style={EMAIL_STYLES.link}
                >
                  {artwork_data.title}
                </Link>
                . We're delighted to provide you with the pricing information
                you requested.
              </Text>

              {/* Artwork Card */}
              <Section className="my-8 p-6 bg-gray-50 rounded-lg">
                <div className="text-center mb-6">
                  <Img
                    src={image}
                    alt={artwork_data.title}
                    className="mx-auto rounded-lg shadow-md"
                    style={{
                      maxWidth: "300px",
                      width: "100%",
                      height: "auto",
                      maxHeight: "350px",
                      objectFit: "cover",
                    }}
                  />
                </div>

                {/* Artwork Details */}
                <table
                  className="w-full"
                  style={{
                    borderCollapse: "separate",
                    borderSpacing: "0 12px",
                  }}
                >
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
                        <strong>{artwork_data.title}</strong>
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
                        Artist:
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
                        <strong>{artwork_data.artist}</strong>
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
                        Medium:
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
                        <strong>{artwork_data.medium}</strong>
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
                          ...EMAIL_STYLES.text.base,
                          margin: "0",
                          fontWeight: "600",
                          color: EMAIL_COLORS.gray[600],
                        }}
                      >
                        Base Price:
                      </Text>
                    </td>
                    <td style={{ paddingTop: "8px" }}>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.base,
                          margin: "0",
                          fontSize: "20px",
                          fontWeight: "700",
                          color: EMAIL_COLORS.primary,
                        }}
                      >
                        {formatPrice(artwork_data.pricing.usd_price)}
                      </Text>
                    </td>
                  </tr>
                </table>
              </Section>

              {/* CTA Button */}
              <Section className="text-center my-8">
                <Button
                  href={`${base_url()}/purchase/${artwork_data.title}`}
                  style={EMAIL_STYLES.button.primary}
                >
                  Purchase This Artwork
                </Button>
              </Section>

              {/* Additional Information */}
              <Section className="my-6 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                <Text
                  style={{
                    ...EMAIL_STYLES.text.small,
                    marginBottom: "0",
                    color: EMAIL_COLORS.warning,
                  }}
                >
                  <strong>Please note:</strong> The base price shown does not
                  include shipping, taxes, or other applicable fees. These will
                  be calculated during checkout based on your location.
                </Text>
              </Section>

              <Text style={EMAIL_STYLES.text.base}>
                If you have any questions about this artwork or would like to
                learn more about the artist, please don't hesitate to reach out.
                We're here to help you make an informed decision.
              </Text>

              <Text style={EMAIL_STYLES.text.base}>
                Thank you for considering{" "}
                <Link
                  href={`${base_url()}/artwork/${artwork_data.title}`}
                  style={EMAIL_STYLES.link}
                >
                  {artwork_data.title}
                </Link>
                . We look forward to helping you add this beautiful piece to
                your collection.
              </Text>

              <Text style={EMAIL_STYLES.text.base}>
                Best regards,
                <br />
                <strong>
                  {EMAIL_SIGNATURES.default.name} from{" "}
                  {EMAIL_SIGNATURES.default.company}
                </strong>
              </Text>
            </Section>

            {/* Reusable Footer */}
            <EmailFooter
              recipientName={name}
              supportTitle="Questions about this artwork?"
              supportMessage="Our art consultants can provide additional details about the piece, artist, or shipping options. Contact us at"
            />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default RequestPriceEmail;
