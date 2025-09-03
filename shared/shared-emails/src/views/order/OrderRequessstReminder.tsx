import { dashboard_url, getApiUrl } from "@omenai/url-config/src/config";
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
import EmailFooter from "../../components/Footer";

const OrderRequestReminder = (name: string) => {
  const url = dashboard_url();

  return (
    <Html>
      <Head />
      <Preview>New order request awaiting your review</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto my-10 bg-white rounded-lg shadow-sm max-w-[600px]">
            {/* Header Section */}
            <Section className="px-8 py-6 text-center border-b border-gray-200">
              <Img
                src={
                  "https://fra.cloud.appwrite.io/v1/storage/buckets/68227462000f77619b04/files/68b8ccd6000dedf704d5/view?project=682273fc00235a5bdb6c"
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
                🔔 New Order Request
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
                Great news! You have a new order request waiting for your
                review. A potential customer is interested in purchasing your
                artwork.
              </Text>

              {/* CTA Button */}
              <Section className="text-center my-8">
                <Link
                  className="px-8 py-4 rounded-lg font-medium text-white inline-block"
                  style={{
                    backgroundColor: "#0f172a",
                    color: "#ffffff",
                    textDecoration: "none",
                  }}
                  href={`${url}/gallery/orders`}
                >
                  Review Order Request
                </Link>
              </Section>

              {/* Action Items Box */}
              <Section className="my-6 p-6 bg-gray-50 rounded-lg">
                <Text
                  className="text-base mb-4 font-semibold"
                  style={{ color: "#0f172a" }}
                >
                  Quick actions available:
                </Text>
                <table style={{ width: "100%" }}>
                  <tr>
                    <td
                      style={{
                        paddingBottom: "8px",
                        verticalAlign: "top",
                        width: "24px",
                      }}
                    >
                      <Text
                        className="text-sm m-0"
                        style={{ color: "#1e40af" }}
                      >
                        •
                      </Text>
                    </td>
                    <td style={{ paddingBottom: "8px" }}>
                      <Text
                        className="text-sm m-0"
                        style={{ color: "#4b5563", lineHeight: "1.5" }}
                      >
                        Review complete order details and customer information
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: "8px", verticalAlign: "top" }}>
                      <Text
                        className="text-sm m-0"
                        style={{ color: "#1e40af" }}
                      >
                        •
                      </Text>
                    </td>
                    <td style={{ paddingBottom: "8px" }}>
                      <Text
                        className="text-sm m-0"
                        style={{ color: "#4b5563", lineHeight: "1.5" }}
                      >
                        Accept or decline the request with a custom message
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top" }}>
                      <Text
                        className="text-sm m-0"
                        style={{ color: "#1e40af" }}
                      >
                        •
                      </Text>
                    </td>
                    <td>
                      <Text
                        className="text-sm m-0"
                        style={{ color: "#4b5563", lineHeight: "1.5" }}
                      >
                        Provide shipping quotes and applicable taxes
                      </Text>
                    </td>
                  </tr>
                </table>
              </Section>

              {/* Reminder Box */}
              <Section className="my-6 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                <Text
                  className="text-sm m-0"
                  style={{ color: "#92400e", lineHeight: "1.5" }}
                >
                  <strong>Remember:</strong> Quick responses lead to higher
                  conversion rates and better customer satisfaction. Orders
                  expire automatically after 48 hours.
                </Text>
              </Section>

              <Text
                className="text-base mb-4"
                style={{ color: "#0f172a", lineHeight: "1.6" }}
              >
                Thank you for being a valued partner. Your dedication to
                providing exceptional art and service helps make our platform a
                trusted destination for art collectors worldwide.
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
            <EmailFooter recipientName={name} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default OrderRequestReminder;
