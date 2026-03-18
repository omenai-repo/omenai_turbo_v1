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

interface OrderRequestReminderProps {
  name: string;
  artworkTitle: string;
  artistName: string;
  price: string;
  artworkImage: string;
  entity: "artist" | "gallery";
}

export const OrderRequestReminder = ({
  name,
  artworkTitle,
  artistName,
  price,
  artworkImage,
  entity,
}: OrderRequestReminderProps) => {
  const url = dashboard_url();
  const optimizedImage = getImageFileView(artworkImage, 400);
  const route_url =
    entity === "artist" ? `${url}/artist/app/orders` : `${url}/gallery/orders`;

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
        Checking in: You have a pending order request for {artworkTitle}.
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
                letterSpacing: "-0.3px",
                margin: "0 0 24px 0",
              }}
            >
              Pending order request Follow-up
            </Heading>

            <Text className="text-main text-gray-800" style={textStyle}>
              Hello <strong>{name}</strong>,
            </Text>

            <Text className="text-main text-gray-800" style={textStyle}>
              We’re checking in to ensure you saw the recent order request for
              your artwork. We wanted to follow up and see if you needed any
              assistance in finalizing the details for this collector.
            </Text>

            <EmailArtworkCard
              artwork={artworkTitle}
              artistName={artistName}
              price={price}
              artworkImage={optimizedImage}
            />

            <Section style={{ textAlign: "center", margin: "32px 0" }}>
              <Button
                href={route_url}
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
                View order Details
              </Button>
            </Section>

            <Text className="text-main text-gray-800" style={textStyle}>
              Providing a timely response helps build a lasting relationship
              with the collector and increases the likelihood of a successful
              sale.
            </Text>

            <Text
              className="text-main text-gray-800"
              style={{ ...textStyle, marginTop: "32px" }}
            >
              Thank you for your continued partnership.
              <br />
              <br />
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
                The Omenai Team
              </span>
            </Text>

            <Hr
              className="border-divider border-gray-200"
              style={{ margin: "32px 0" }}
            />

            <Section style={{ textAlign: "center" }}>
              <Text
                className="text-muted text-gray-400"
                style={{ fontSize: "12px", margin: "0" }}
              >
                Note: To maintain platform standards, unaddressed inquiries
                typically expire after 48 hours.
              </Text>
            </Section>

            <EmailFooter recipientName={name} showSupportSection={false} />
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

export default OrderRequestReminder;
