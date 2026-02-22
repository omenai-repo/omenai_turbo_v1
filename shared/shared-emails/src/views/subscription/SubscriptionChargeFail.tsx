import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
  Link,
  Hr,
} from "@react-email/components";
import * as React from "react";
import EmailFooter from "../../components/Footer";
import { COMPANY_INFO } from "../../constants/constants";

interface PaymentFailedEmailProps {
  recipientName: string;
  subscriptionPlan: string;
  lastPaymentAttemptDate: string;
  amountDue: string;
  accountUrl?: string;
  lastFourDigits?: string;
  cardType?: string;
  email?: string;
}

export const PaymentFailedEmail = ({
  recipientName,
  subscriptionPlan,
  lastPaymentAttemptDate,
  amountDue,
  accountUrl = "https://omenai.com/account/billing",
  lastFourDigits,
  cardType,
}: PaymentFailedEmailProps) => {
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
              .bg-box { background-color: #1f2937 !important; border-color: #374151 !important; }
              .border-divider { border-color: #374151 !important; }
              .advisory-box { background-color: #3f3f46 !important; border-left-color: #fbbf24 !important; }
              .btn-main { background-color: #ffffff !important; color: #000000 !important; }
            }
          `}
        </style>
      </Head>
      <Preview>
        Action Required: Please update your payment method to maintain your
        Omenai subscription.
      </Preview>
      <Tailwind>
        <Body
          className="body-bg font-sans bg-gray-50"
          style={{ margin: "0", padding: "0" }}
        >
          <Container
            className="container-bg bg-white my-10 rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            style={{ maxWidth: "600px" }}
          >
            {/* Header Section */}
            <Section className="px-8 py-8 text-center border-b border-gray-100 border-divider">
              <Img
                src={COMPANY_INFO.logo}
                width="140"
                height="24"
                alt={`${COMPANY_INFO.name} logo`}
                className="mx-auto"
              />
            </Section>

            {/* Elevated Advisory Banner - Swapped from Red to Amber/Slate */}
            <Section className="bg-box bg-gray-50 px-8 py-5 border-b border-gray-200 border-divider">
              <Text
                className="heading-main text-center m-0 text-gray-900"
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Billing Advisory
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="px-8 py-8">
              <Heading
                as="h2"
                className="heading-main text-gray-900"
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  letterSpacing: "-0.5px",
                  marginBottom: "24px",
                }}
              >
                Action Required: Billing Update
              </Heading>

              <Text className="text-main text-gray-800" style={textStyle}>
                Hello <strong>{recipientName}</strong>,
              </Text>

              <Text className="text-main text-gray-800" style={textStyle}>
                We were unable to process the recent charge for your{" "}
                {COMPANY_INFO.name} subscription. To ensure uninterrupted access
                to your dashboard and premium features, please update your
                payment method.
              </Text>

              {/* Payment Details Grid */}
              <Section className="bg-box bg-gray-50 rounded-lg p-6 my-8 border border-gray-200 border-divider">
                <Text
                  className="heading-main text-gray-900"
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    marginBottom: "20px",
                  }}
                >
                  Invoice Overview
                </Text>

                <table
                  className="w-full"
                  style={{ borderCollapse: "collapse" }}
                >
                  <tbody>
                    <tr style={rowStyle}>
                      <td
                        style={labelCell}
                        className="text-muted text-gray-500"
                      >
                        Plan:
                      </td>
                      <td
                        style={valueCell}
                        className="text-main text-gray-900 font-medium"
                      >
                        {subscriptionPlan}
                      </td>
                    </tr>
                    <tr style={rowStyle}>
                      <td
                        style={labelCell}
                        className="text-muted text-gray-500"
                      >
                        Amount Due:
                      </td>
                      <td
                        style={valueCell}
                        className="text-main text-gray-900 font-semibold"
                      >
                        {amountDue}
                      </td>
                    </tr>
                    <tr style={rowStyle}>
                      <td
                        style={labelCell}
                        className="text-muted text-gray-500"
                      >
                        Last Attempt:
                      </td>
                      <td style={valueCell} className="text-main text-gray-900">
                        {lastPaymentAttemptDate}
                      </td>
                    </tr>
                    {lastFourDigits && cardType && (
                      <tr>
                        <td
                          style={{
                            ...labelCell,
                            paddingTop: "12px",
                            borderBottom: "none",
                          }}
                          className="text-muted text-gray-500"
                        >
                          Method:
                        </td>
                        <td
                          style={{
                            ...valueCell,
                            paddingTop: "12px",
                            borderBottom: "none",
                          }}
                          className="text-main text-gray-900"
                        >
                          {cardType} ending in •••• {lastFourDigits}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Section>

              {/* Suspension Notice */}
              <Section className="advisory-box bg-amber-50 rounded-r-lg p-5 border-l-4 border-amber-400 mb-8">
                <Text
                  className="text-main text-gray-800 m-0"
                  style={{ fontSize: "14px", lineHeight: "1.6" }}
                >
                  <strong
                    className="text-gray-900 heading-main"
                    style={{ fontWeight: "600" }}
                  >
                    Please Note:
                  </strong>{" "}
                  Your subscription benefits are temporarily paused. Updating
                  your billing information will immediately restore full access
                  to your account.
                </Text>
              </Section>

              {/* Centralized CTA */}
              <Section style={{ textAlign: "center", margin: "32px 0" }}>
                <Link
                  href={accountUrl}
                  className="btn-main"
                  style={{
                    display: "inline-block",
                    backgroundColor: "#000000",
                    color: "#ffffff",
                    padding: "14px 32px",
                    borderRadius: "6px",
                    textDecoration: "none",
                    fontSize: "15px",
                    fontWeight: "500",
                    letterSpacing: "0.3px",
                  }}
                >
                  Manage Billing Settings
                </Link>
              </Section>

              <Hr
                className="border-divider border-gray-200"
                style={{ margin: "32px 0" }}
              />

              {/* Troubleshooting Context */}
              <Text
                className="text-main text-gray-900"
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "12px",
                }}
              >
                Common reasons for payment failure:
              </Text>
              <Text
                className="text-muted text-gray-600"
                style={{
                  fontSize: "14px",
                  lineHeight: "1.6",
                  margin: "0 0 24px 0",
                }}
              >
                • Insufficient funds or card limit reached
                <br />
                • Expired credit card details
                <br />• Bank security holds on automated or international
                charges
              </Text>

              <Text
                className="text-muted text-gray-600"
                style={{ fontSize: "14px", lineHeight: "1.6" }}
              >
                We highly value your presence in the Omenai community. If you
                require assistance or wish to discuss your subscription, please
                do not hesitate to reach out.
                <br />
                <br />
                Warmly,
                <br />
                <strong className="heading-main text-gray-900">
                  The Omenai Billing Team
                </strong>
              </Text>
            </Section>

            {/* Reusable Footer */}
            <EmailFooter
              recipientName={recipientName}
              supportTitle="Having trouble with your payment?"
              supportMessage="Our client services team is ready to assist you. Contact us at"
            />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

// Shared Styles
const textStyle = {
  fontSize: "16px",
  lineHeight: "1.6",
  marginBottom: "16px",
};

const labelCell = {
  width: "120px",
  paddingBottom: "12px",
  fontSize: "14px",
  verticalAlign: "top",
};

const valueCell = {
  paddingBottom: "12px",
  fontSize: "15px",
  verticalAlign: "top",
};

const rowStyle = {
  borderBottom: "1px solid #f3f4f6",
};

// For React Email Heading component if not globally imported
const Heading = ({ as: Tag = "h1", style, className, children }: any) => (
  <Tag style={style} className={className}>
    {children}
  </Tag>
);

export default PaymentFailedEmail;
