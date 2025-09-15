import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { base_url } from "@omenai/url-config/src/config";
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
  Row,
  Column,
} from "@react-email/components";
import {
  EMAIL_STYLES,
  COMPANY_INFO,
  EMAIL_SIGNATURES,
} from "../../constants/constants";
import * as React from "react";
import EmailFooter from "../../components/Footer";

interface OrderDeclinedEmailProps {
  recipientName: string;
  declineReason: string;
  artwork: Pick<
    ArtworkSchemaTypes,
    "title" | "artist" | "art_id" | "pricing" | "url"
  >;
}

export const OrderDeclinedEmail: React.FC<OrderDeclinedEmailProps> = ({
  recipientName,
  declineReason,
  artwork,
}) => {
  const baseUrl = base_url();
  const artworkUrl = `${baseUrl}/artwork/${artwork.title}`;
  const catalogUrl = `${baseUrl}/catalog`;

  return (
    <Html>
      <Head />
      <Preview>Order request for {artwork.title} has been declined</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container
            style={EMAIL_STYLES.container}
            className="my-10 rounded shadow-sm"
          >
            {/* Header Section */}
            <Section className="px-8 pt-6 text-center border-b border-gray-200">
              <Img
                src={COMPANY_INFO.logo}
                width="140"
                height="24"
                alt={`${COMPANY_INFO.name} logo`}
                className="mx-auto"
              />
            </Section>

            {/* Main Content */}
            <Section className="px-8 pb-8">
              <Text style={EMAIL_STYLES.heading.h1}>Order Request Update</Text>

              <Text style={EMAIL_STYLES.text.base}>
                Dear <strong>{recipientName}</strong>,
              </Text>

              <Text style={EMAIL_STYLES.text.base}>
                Thank you for your interest in{" "}
                <Link href={artworkUrl} style={EMAIL_STYLES.link}>
                  {artwork.title}
                </Link>
                .Unfortunately, your order request for this artwork has been
                declined.
              </Text>

              {/* Reason Section */}
              <Section className="my-6 p-6 bg-gray-50 rounded border-l-4 border-gray-400">
                <Text
                  style={{ ...EMAIL_STYLES.text.small, marginBottom: "8px" }}
                >
                  <strong>Reason for decline:</strong>
                </Text>
                <Text
                  style={{
                    ...EMAIL_STYLES.text.base,
                    marginBottom: "0",
                    fontStyle: "italic",
                  }}
                >
                  "{declineReason}"
                </Text>
              </Section>

              <Text style={EMAIL_STYLES.text.base}>
                We understand this may be disappointing news. However, we'd love
                to help you discover other exceptional pieces that might
                interest you or you can go ahead and place a new order for this
                piece.
              </Text>

              {/* CTA Section */}
              <Section className="text-center my-8">
                <Button href={catalogUrl} style={EMAIL_STYLES.button.primary}>
                  Explore More Artworks
                </Button>
              </Section>
            </Section>

            <EmailFooter recipientName={recipientName} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default OrderDeclinedEmail;
