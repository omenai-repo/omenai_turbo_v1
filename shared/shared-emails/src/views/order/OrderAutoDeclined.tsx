import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { base_url } from "@omenai/url-config/src/config";
import {
  Body,
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
import * as React from "react";
import {
  COMPANY_INFO,
  EMAIL_COLORS,
  EMAIL_STYLES,
  EMAIL_SIGNATURES,
} from "../../constants/constants";
import EmailFooter from "../../components/Footer";

interface OrderAutoDeclinedEmailProps {
  name: string;
  artwork: Pick<
    ArtworkSchemaTypes,
    "title" | "artist" | "art_id" | "pricing" | "url"
  >;
}

const OrderAutoDeclinedEmail = ({
  name,
  artwork,
}: OrderAutoDeclinedEmailProps) => {
  const baseUrl = base_url();
  const artworkUrl = `${baseUrl}/artwork/${artwork.title}`;

  return (
    <Html>
      <Head />
      <Preview>
        Order request for {artwork.title} has been automatically declined
      </Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container
            style={EMAIL_STYLES.container}
            className="my-10 rounded shadow-sm"
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
                Order Request Automatically Declined
              </Text>

              <Text style={EMAIL_STYLES.text.base}>
                Dear <strong>{name}</strong>,
              </Text>

              <Text style={EMAIL_STYLES.text.base}>
                We regret to inform you that your order request for{" "}
                <Link href={artworkUrl} style={EMAIL_STYLES.link}>
                  {artwork.title}
                </Link>{" "}
                has been automatically declined. This occurred because we did
                not receive a response within the required timeframe.
              </Text>

              <Text style={EMAIL_STYLES.text.base}>
                We understand that managing multiple inquiries and order
                requests can be challenging, and we appreciate your
                understanding.
              </Text>
            </Section>

            <EmailFooter recipientName={name} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default OrderAutoDeclinedEmail;
