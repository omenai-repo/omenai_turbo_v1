import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { base_url, getApiUrl } from "@omenai/url-config/src/config";
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
import {
  EMAIL_STYLES,
  COMPANY_INFO,
  EMAIL_COLORS,
  EMAIL_SIGNATURES,
} from "../../constants/constants";

const OrderRequestReceivedEmail = (
  username: string,
  artwork_data: Pick<
    ArtworkSchemaTypes,
    "title" | "artist" | "art_id" | "pricing" | "url"
  >,
  orderId: string
) => {
  const url = base_url();
  return (
    <Html>
      <Head />
      <Preview>
        We've received your order request for {artwork_data.title}
      </Preview>
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

            {/* Success Banner */}
            <Section className="bg-green-50 px-8 py-4 border-b-4 border-green-500">
              <Text
                className="text-center font-semibold m-0"
                style={{ color: EMAIL_COLORS.success, fontSize: "18px" }}
              >
                ✓ Order Request Received
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="px-8 py-8">
              <Text style={EMAIL_STYLES.text.base}>
                Dear <strong>{username}</strong>,
              </Text>

              <Text style={EMAIL_STYLES.text.base}>
                Thank you for your interest in{" "}
                <Link
                  href={`${base_url()}/artwork/${artwork_data.title}`}
                  style={EMAIL_STYLES.link}
                >
                  {artwork_data.title}
                </Link>
                . We're excited to confirm that we've received your order
                request and our team is now preparing your personalized quote.
              </Text>

              {/* Order Details Box */}
              <Section className="my-6 p-6 bg-gray-50 rounded-lg">
                <Text
                  style={{
                    ...EMAIL_STYLES.text.base,
                    marginBottom: "12px",
                    fontWeight: "600",
                  }}
                >
                  What happens next:
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
                      <Text style={{ ...EMAIL_STYLES.text.small, margin: "0" }}>
                        1.
                      </Text>
                    </td>
                    <td style={{ paddingBottom: "8px" }}>
                      <Text style={{ ...EMAIL_STYLES.text.small, margin: "0" }}>
                        We'll calculate shipping costs to your location
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: "8px", verticalAlign: "top" }}>
                      <Text style={{ ...EMAIL_STYLES.text.small, margin: "0" }}>
                        2.
                      </Text>
                    </td>
                    <td style={{ paddingBottom: "8px" }}>
                      <Text style={{ ...EMAIL_STYLES.text.small, margin: "0" }}>
                        We'll determine applicable taxes and fees
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top" }}>
                      <Text style={{ ...EMAIL_STYLES.text.small, margin: "0" }}>
                        3.
                      </Text>
                    </td>
                    <td>
                      <Text style={{ ...EMAIL_STYLES.text.small, margin: "0" }}>
                        You'll receive a detailed quote within{" "}
                        <strong>24-48 hours</strong>
                      </Text>
                    </td>
                  </tr>
                </table>
                {orderId && (
                  <Text
                    style={{
                      ...EMAIL_STYLES.text.tiny,
                      marginTop: "16px",
                      marginBottom: "0",
                    }}
                  >
                    Order Reference: <strong>{orderId}</strong>
                  </Text>
                )}
              </Section>

              <Text style={EMAIL_STYLES.text.base}>
                Once we've prepared your quote, we'll send you a detailed
                breakdown of all costs and guide you through the next steps to
                complete your purchase.
              </Text>

              <Text style={EMAIL_STYLES.text.base}>
                In the meantime, if you have any questions or special
                requirements, please don't hesitate to reach out. We're here to
                ensure a smooth and enjoyable art acquisition experience.
              </Text>

              <Text style={EMAIL_STYLES.text.base}>
                We appreciate your patience and look forward to helping you add
                this beautiful piece to your collection.
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
              recipientName={username}
              supportTitle="Have questions?"
              supportMessage="Our team is ready to assist you with your order. Contact us at"
            />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default OrderRequestReceivedEmail;
