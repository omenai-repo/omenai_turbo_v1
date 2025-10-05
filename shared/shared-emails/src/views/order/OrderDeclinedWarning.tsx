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
} from "@react-email/components";
import * as React from "react";
import EmailFooter from "../../components/Footer";
import {
  EMAIL_STYLES,
  COMPANY_INFO,
  EMAIL_COLORS,
  EMAIL_SIGNATURES,
} from "../../constants/constants";

interface OrderDeclinedWarningEmailProps {
  name: string;
}

export const OrderDeclinedWarningEmail = ({
  name,
}: OrderDeclinedWarningEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Action required: Pending orders will expire in 24 hours</Preview>
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

            {/* Urgent Notice Banner */}
            <Section className="bg-amber-50 px-8 py-4 border-b-4 border-amber-400">
              <Text
                className="text-center font-semibold m-0"
                style={{ color: EMAIL_COLORS.warning, fontSize: "18px" }}
              >
                ⚠️ Action Required: Orders Expiring Soon
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="px-8 py-8">
              <Text style={EMAIL_STYLES.text.base}>
                Dear <strong>{name}</strong>,
              </Text>

              <Text style={EMAIL_STYLES.text.base}>
                You have pending order requests that require your immediate
                attention. These orders will be automatically declined if not
                addressed within the next <strong>24 hours</strong>.
              </Text>

              {/* Key Information Box */}
              <Section className="my-6 p-6 bg-amber-50 rounded border-l-4 border-amber-400">
                <Text
                  style={{
                    ...EMAIL_STYLES.text.base,
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  What happens next:
                </Text>
                <Text
                  style={{ ...EMAIL_STYLES.text.small, marginBottom: "4px" }}
                >
                  • Orders will automatically expire after 24 hours
                </Text>
                <Text
                  style={{ ...EMAIL_STYLES.text.small, marginBottom: "4px" }}
                >
                  • Customers will be notified of the cancellation
                </Text>
                <Text style={{ ...EMAIL_STYLES.text.small, marginBottom: "0" }}>
                  • You may lose potential sales opportunities
                </Text>
              </Section>

              <Text style={EMAIL_STYLES.text.base}>
                To ensure a positive experience for your customers and avoid
                missed opportunities, please review and respond to these
                requests promptly.
              </Text>

              {/* CTA Button */}
              {/* <Section className="text-center my-8">
                <Button
                  href={`${dashboard_url()}`}
                  style={{
                    ...EMAIL_STYLES.button.primary,
                    backgroundColor: EMAIL_COLORS.warning,
                  }}
                >
                  Review Pending Orders
                </Button>
              </Section> */}

              <Text style={EMAIL_STYLES.text.base}>
                We're here to support you. If you need assistance managing your
                orders or have any questions, please don't hesitate to reach
                out.
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
              supportTitle="Need help managing orders?"
              supportMessage="Our team can assist you with order management and best practices. Contact us at"
            />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default OrderDeclinedWarningEmail;
