import { ArtworkSchemaTypes } from "@omenai/shared-types";
import {
  base_url,
  dashboard_url,
  getApiUrl,
} from "@omenai/url-config/src/config";
import {
  getImageFileView,
  getOptimizedImage,
} from "@omenai/shared-lib/storage/getImageFileView";
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

const OrderRequestToGalleryMail = (
  name: string,
  buyer: string,
  date: string,
  artwork_data: Pick<
    ArtworkSchemaTypes,
    "title" | "artist" | "art_id" | "pricing" | "url"
  >,
) => {
  const url = base_url();
  const dashboard_uri = dashboard_url();
  const image = getOptimizedImage(artwork_data.url, "thumbnail", 40);
  return (
    <Html>
      <Head />
      <Preview>New order request for {artwork_data.title}</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto my-10 bg-white rounded shadow-sm max-w-[600px]">
            {/* Header Section */}
            <Section className="px-8 py-6 text-center border-b border-gray-200">
              <Img
                src={
                  "https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/696ee3b60025e2a2c4ff/view?project=682272b1001e9d1609a8"
                }
                width="140"
                height="24"
                alt="Omenai logo"
                className="mx-auto"
              />
            </Section>

            {/* Notification Banner */}
            <Section className="bg-blue-50 px-8 py-4 border-b-4 border-blue-500">
              <Text
                className="text-center font-semibold m-0"
                style={{ color: "#1e40af", fontSize: "18px" }}
              >
                🎨 New Artwork Order Request
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="px-8 py-8">
              <Text
                className="text-base mb-4"
                style={{ color: "#0f172a", lineHeight: "1.6" }}
              >
                Dear <strong>{name}</strong>,
              </Text>

              <Text
                className="text-base mb-6"
                style={{ color: "#0f172a", lineHeight: "1.6" }}
              >
                Exciting news! A collector has expressed interest in purchasing{" "}
                <Link
                  href={`${url}/artwork/${artwork_data.title}`}
                  style={{ color: "#1e40af", textDecoration: "underline" }}
                >
                  {artwork_data.title}
                </Link>
                .
              </Text>

              {/* Artwork Preview Card */}
              <Section className="my-8 p-6 bg-gray-50 rounded">
                <div className="text-center">
                  <Img
                    src={image}
                    alt={artwork_data.title}
                    className="mx-auto rounded shadow-md"
                    style={{
                      maxWidth: "280px",
                      width: "100%",
                      height: "auto",
                      maxHeight: "320px",
                      objectFit: "cover",
                    }}
                  />
                </div>

                {/* Order Details */}
                <table
                  className="w-full mt-6"
                  style={{ borderCollapse: "separate", borderSpacing: "0 8px" }}
                >
                  <tr>
                    <td style={{ padding: "8px 0", width: "120px" }}>
                      <Text
                        className="text-sm font-semibold m-0"
                        style={{ color: "#4b5563" }}
                      >
                        Artwork:
                      </Text>
                    </td>
                    <td style={{ padding: "8px 0" }}>
                      <Text
                        className="text-sm m-0"
                        style={{ color: "#0f172a" }}
                      >
                        {artwork_data.title}
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px 0" }}>
                      <Text
                        className="text-sm font-semibold m-0"
                        style={{ color: "#4b5563" }}
                      >
                        Buyer:
                      </Text>
                    </td>
                    <td style={{ padding: "8px 0" }}>
                      <Text
                        className="text-sm m-0"
                        style={{ color: "#0f172a" }}
                      >
                        {buyer}
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px 0" }}>
                      <Text
                        className="text-sm font-semibold m-0"
                        style={{ color: "#4b5563" }}
                      >
                        Request Date:
                      </Text>
                    </td>
                    <td style={{ padding: "8px 0" }}>
                      <Text
                        className="text-sm m-0"
                        style={{ color: "#0f172a" }}
                      >
                        {date}
                      </Text>
                    </td>
                  </tr>
                </table>
              </Section>

              {/* CTA Button */}
              <Section className="text-center my-8">
                <Link
                  className="px-8 py-4 rounded font-medium text-white inline-block"
                  style={{
                    backgroundColor: "#0f172a",
                    color: "#ffffff",
                    textDecoration: "none",
                  }}
                  href={`${dashboard_uri}/gallery/orders`}
                >
                  Review Order Details
                </Link>
              </Section>

              {/* Action Items */}
              <Section className="my-6 p-6 bg-blue-50 rounded">
                <Text
                  className="text-base mb-4 font-semibold"
                  style={{ color: "#0f172a" }}
                >
                  Next steps:
                </Text>
                <table style={{ width: "100%" }}>
                  <tr>
                    <td
                      style={{
                        paddingBottom: "8px",
                        verticalAlign: "top",
                        width: "30px",
                      }}
                    >
                      <Text
                        className="text-sm m-0"
                        style={{ color: "#059669" }}
                      >
                        ✓
                      </Text>
                    </td>
                    <td style={{ paddingBottom: "8px" }}>
                      <Text
                        className="text-sm m-0"
                        style={{ color: "#4b5563", lineHeight: "1.5" }}
                      >
                        Review complete order details and buyer information
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: "8px", verticalAlign: "top" }}>
                      <Text
                        className="text-sm m-0"
                        style={{ color: "#059669" }}
                      >
                        ✓
                      </Text>
                    </td>
                    <td style={{ paddingBottom: "8px" }}>
                      <Text
                        className="text-sm m-0"
                        style={{ color: "#4b5563", lineHeight: "1.5" }}
                      >
                        Accept or decline with a personalized response
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top" }}>
                      <Text
                        className="text-sm m-0"
                        style={{ color: "#059669" }}
                      >
                        ✓
                      </Text>
                    </td>
                    <td>
                      <Text
                        className="text-sm m-0"
                        style={{ color: "#4b5563", lineHeight: "1.5" }}
                      >
                        Provide shipping quote and applicable taxes
                      </Text>
                    </td>
                  </tr>
                </table>
              </Section>

              {/* Time Reminder */}
              <Section className="my-6 p-4 bg-amber-50 rounded border-l-4 border-amber-400">
                <Text
                  className="text-sm m-0"
                  style={{ color: "#92400e", lineHeight: "1.5" }}
                >
                  <strong>⏰ Time-sensitive:</strong> Please respond within 48
                  hours to maintain buyer interest and ensure a positive
                  experience.
                </Text>
              </Section>

              <Text
                className="text-base mb-4"
                style={{ color: "#0f172a", lineHeight: "1.6" }}
              >
                Your prompt response helps build trust with collectors and
                increases the likelihood of successful sales. We're here to
                support you throughout the transaction process.
              </Text>

              <Text
                className="text-base"
                style={{ color: "#0f172a", lineHeight: "1.6" }}
              >
                Best regards,
                <br />
                <strong>Moses from Omenai</strong>
              </Text>
            </Section>

            {/* Support Section */}
            <Section className="my-8 mx-8 p-6 bg-gray-50 rounded">
              <Text className="text-base mb-2" style={{ color: "#0f172a" }}>
                <strong>Need help?</strong>
              </Text>
              <Text
                className="text-sm m-0"
                style={{ color: "#4b5563", lineHeight: "1.5" }}
              >
                Our gallery support team is ready to assist. Contact us at{" "}
                <Link
                  href="mailto:contact@omenai.net"
                  style={{ color: "#1e40af", textDecoration: "underline" }}
                >
                  contact@omenai.net
                </Link>
              </Text>
            </Section>

            {/* Footer Section */}
            <Section className="px-8 py-6 bg-gray-50 border-t border-gray-200">
              <Img
                src={
                  "https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/696ee3b60025e2a2c4ff/view?project=682272b1001e9d1609a8"
                }
                width="100"
                height="20"
                alt="Omenai logo"
                className="mb-4"
              />
              <Text
                className="text-sm m-0"
                style={{ color: "#4b5563", lineHeight: "1.5" }}
              >
                123 Main Street Anytown, CA 12345
              </Text>
              <Text
                className="text-sm m-0"
                style={{ color: "#4b5563", lineHeight: "1.5" }}
              >
                contact@omenai.net • +123456789
              </Text>
            </Section>

            {/* Legal Notice */}
            <Section className="px-8 py-4 bg-gray-100">
              <Text
                className="text-xs text-center m-0"
                style={{ color: "#4b5563", lineHeight: "1.5" }}
              >
                This email is intended solely for <strong>{name}</strong> and
                may contain confidential information. If you received this
                message in error, please notify us immediately and delete it
                from your system. Unauthorized use or distribution is
                prohibited.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default OrderRequestToGalleryMail;
