import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { base_url } from "@omenai/url-config/src/config";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Tailwind,
  Section,
  Img,
  Text,
  Link,
  Preview,
  Column,
  Row,
  Button,
} from "@react-email/components";
import * as React from "react";
import { EMAIL_COLORS, COMPANY_INFO } from "../../constants/constants";
import EmailFooter from "../../components/Footer";

interface OrderAcceptedEmailProps {
  name: string;
  orderId: string;
  userId: string;
  artwork: Pick<
    ArtworkSchemaTypes,
    "title" | "artist" | "art_id" | "pricing" | "url"
  >;
}

export const OrderAcceptedEmail = ({
  name,
  orderId,
  userId,
  artwork,
}: OrderAcceptedEmailProps) => {
  const baseUrl = base_url();
  const paymentUrl = `${baseUrl}/payment/${orderId}?id_key=${userId}`;
  const artworkUrl = `${baseUrl}/artwork/${artwork.title}`;

  return (
    <Html>
      <Head />
      <Preview>
        Your order request for {artwork.title} has been accepted
      </Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto my-10 bg-white rounded shadow-sm max-w-[600px]">
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
              <Heading
                className="text-2xl font-semibold text-center mb-8"
                style={{ color: EMAIL_COLORS.primary }}
              >
                Your order request has been accepted
              </Heading>

              <Text
                className="text-base mb-4"
                style={{ color: EMAIL_COLORS.primary, lineHeight: "1.6" }}
              >
                Hello <strong>{name}</strong>,
              </Text>

              <Text
                className="text-base mb-4"
                style={{ color: EMAIL_COLORS.primary, lineHeight: "1.6" }}
              >
                We are thrilled to inform you that your order request for{" "}
                <Link
                  href={artworkUrl}
                  style={{
                    color: EMAIL_COLORS.link,
                    textDecoration: "underline",
                  }}
                >
                  {artwork.title}
                </Link>{" "}
                has been accepted. All the necessary information, including
                shipping quotes and applicable taxes, has been provided to
                facilitate the purchase of this exquisite artwork.
              </Text>

              <Text
                className="text-base mb-6"
                style={{ color: EMAIL_COLORS.primary, lineHeight: "1.6" }}
              >
                You can now proceed with the payment for your artwork. To
                complete your purchase, please click the button below:
              </Text>

              {/* CTA Button */}
              <Section className="text-center my-8">
                <Button
                  href={paymentUrl}
                  className="px-8 py-4 rounded font-medium text-white"
                  style={{
                    backgroundColor: EMAIL_COLORS.primary,
                    color: EMAIL_COLORS.background,
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  Pay for this artwork
                </Button>
              </Section>

              <Text
                className="text-base mb-6"
                style={{ color: EMAIL_COLORS.primary, lineHeight: "1.6" }}
              >
                Kindly note, Payment is required within 24 hours to finalize
                your purchase. Orders that remain unpaid after this period will
                be automatically canceled and the artwork will be made available
                to other buyers.
              </Text>

              <Text
                className="text-base mb-4"
                style={{ color: EMAIL_COLORS.primary, lineHeight: "1.6" }}
              >
                If you have any questions or need further assistance regarding
                the payment process or your order, please feel free to reach out
                to us at{" "}
                <Link
                  href={`mailto:${COMPANY_INFO.email}`}
                  style={{
                    color: EMAIL_COLORS.link,
                    textDecoration: "underline",
                  }}
                >
                  {COMPANY_INFO.email}
                </Link>
                . We are here to help ensure a smooth and enjoyable experience.
              </Text>

              <Text
                className="text-base mb-4"
                style={{ color: EMAIL_COLORS.primary, lineHeight: "1.6" }}
              >
                Thank you for choosing to support artists on our platform. We
                greatly appreciate your patronage and look forward to seeing
                this stunning artwork find its new home with you.
              </Text>

              <Text
                className="text-base"
                style={{ color: EMAIL_COLORS.primary, lineHeight: "1.6" }}
              >
                Best regards,
                <br />
                <strong>Moses from {COMPANY_INFO.name}</strong>
              </Text>
            </Section>

            <EmailFooter recipientName={name} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default OrderAcceptedEmail;
