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
  Button,
} from "@react-email/components";
import * as React from "react";
import EmailFooter from "../../components/Footer";
import {
  EMAIL_STYLES,
  COMPANY_INFO,
  EMAIL_COLORS,
  EMAIL_SIGNATURES,
} from "../../constants/constants";

interface PaymentFailedEmailProps {
  recipientName: string;
  subscriptionPlan: string;
  lastPaymentAttemptDate: string;
  amountDue: string;
  accountUrl?: string;
  lastFourDigits?: string;
  cardType?: string;
}

export const PaymentFailedEmail = ({
  recipientName,
  subscriptionPlan,
  lastPaymentAttemptDate,
  amountDue,
  accountUrl = "/account/billing",
  lastFourDigits,
  cardType,
}: PaymentFailedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        Action required: Update your payment method to continue your
        subscription
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

            {/* Alert Banner */}
            <Section className="bg-red-50 px-8 py-4 border-b-4 border-red-500">
              <Text
                className="text-center font-semibold m-0"
                style={{ color: EMAIL_COLORS.error, fontSize: "18px" }}
              >
                ⚠️ Payment Failed - Action Required
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="px-8 py-8">
              <Text style={EMAIL_STYLES.heading.h1}>
                We couldn't process your payment
              </Text>

              <Text style={EMAIL_STYLES.text.base}>
                Hi <strong>{recipientName}</strong>,
              </Text>

              <Text style={EMAIL_STYLES.text.base}>
                We were unable to charge your payment method for your{" "}
                {COMPANY_INFO.name} subscription. To continue enjoying
                uninterrupted access to our platform, please update your payment
                information and resubscribe.
              </Text>

              {/* Payment Details */}
              <Section className="my-8 p-6 bg-gray-50 rounded">
                <Text
                  style={{
                    ...EMAIL_STYLES.text.base,
                    marginBottom: "16px",
                    fontWeight: "600",
                  }}
                >
                  Payment Details:
                </Text>

                <table
                  className="w-full"
                  style={{
                    borderCollapse: "separate",
                    borderSpacing: "0 12px",
                  }}
                >
                  <tr>
                    <td
                      style={{
                        paddingRight: "16px",
                        verticalAlign: "top",
                        width: "160px",
                      }}
                    >
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          color: EMAIL_COLORS.gray[600],
                        }}
                      >
                        Subscription Plan:
                      </Text>
                    </td>
                    <td>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          color: EMAIL_COLORS.primary,
                          fontWeight: "600",
                        }}
                      >
                        {subscriptionPlan}
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingRight: "16px", verticalAlign: "top" }}>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          color: EMAIL_COLORS.gray[600],
                        }}
                      >
                        Amount Due:
                      </Text>
                    </td>
                    <td>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          color: EMAIL_COLORS.primary,
                          fontWeight: "600",
                        }}
                      >
                        {amountDue}
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingRight: "16px", verticalAlign: "top" }}>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          color: EMAIL_COLORS.gray[600],
                        }}
                      >
                        Last Attempt:
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
                        {lastPaymentAttemptDate}
                      </Text>
                    </td>
                  </tr>
                  {lastFourDigits && cardType && (
                    <tr>
                      <td
                        style={{ paddingRight: "16px", verticalAlign: "top" }}
                      >
                        <Text
                          style={{
                            ...EMAIL_STYLES.text.small,
                            margin: "0",
                            color: EMAIL_COLORS.gray[600],
                          }}
                        >
                          Payment Method:
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
                          {cardType} ending in {lastFourDigits}
                        </Text>
                      </td>
                    </tr>
                  )}
                </table>
              </Section>

              {/* Action Steps */}
              <Section className="my-8 p-6 bg-blue-50 rounded">
                <Text
                  style={{
                    ...EMAIL_STYLES.text.base,
                    marginBottom: "16px",
                    fontWeight: "600",
                  }}
                >
                  To restore your subscription:
                </Text>

                <table style={{ width: "100%" }}>
                  <tr>
                    <td
                      style={{
                        paddingBottom: "12px",
                        verticalAlign: "top",
                        width: "40px",
                      }}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          backgroundColor: EMAIL_COLORS.link,
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        1
                      </div>
                    </td>
                    <td style={{ paddingBottom: "12px" }}>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          color: EMAIL_COLORS.primary,
                        }}
                      >
                        <strong>Update your payment method</strong> in your
                        account settings
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: "12px", verticalAlign: "top" }}>
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          backgroundColor: EMAIL_COLORS.link,
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        2
                      </div>
                    </td>
                    <td style={{ paddingBottom: "12px" }}>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          color: EMAIL_COLORS.primary,
                        }}
                      >
                        <strong>Resubscribe</strong> to your preferred plan
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: "top" }}>
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          backgroundColor: EMAIL_COLORS.link,
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        3
                      </div>
                    </td>
                    <td>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          color: EMAIL_COLORS.primary,
                        }}
                      >
                        <strong>Continue enjoying</strong> all premium features
                      </Text>
                    </td>
                  </tr>
                </table>
              </Section>

              {/* CTA Button */}
              <Section className="text-center my-8">
                <Button
                  href={accountUrl}
                  style={{
                    ...EMAIL_STYLES.button.primary,
                    backgroundColor: EMAIL_COLORS.error,
                  }}
                >
                  Update Payment Method
                </Button>
              </Section>

              {/* Warning Notice */}
              <Section className="my-6 p-4 bg-amber-50 rounded border-l-4 border-amber-400">
                <Text
                  style={{
                    ...EMAIL_STYLES.text.small,
                    marginBottom: "0",
                    color: EMAIL_COLORS.warning,
                  }}
                >
                  <strong>Note:</strong> Your subscription benefits have been
                  temporarily suspended. Update your payment method soon to
                  avoid losing access to your account data and premium features.
                </Text>
              </Section>

              {/* Common Issues */}
              <Text
                style={{
                  ...EMAIL_STYLES.text.small,
                  marginBottom: "8px",
                  color: EMAIL_COLORS.gray[600],
                }}
              >
                <strong>Common reasons for payment failure:</strong>
              </Text>
              <Text
                style={{
                  ...EMAIL_STYLES.text.small,
                  marginBottom: "16px",
                  color: EMAIL_COLORS.gray[600],
                }}
              >
                • Insufficient funds • Expired card • Card limit reached • Bank
                security hold
              </Text>

              <Text style={EMAIL_STYLES.text.base}>
                We value having you as part of the {COMPANY_INFO.name} community
                and hope to resolve this quickly. If you need assistance or have
                decided not to continue your subscription, please let us know.
              </Text>

              <Text style={EMAIL_STYLES.text.base}>
                Best regards,
                <br />
                <strong>
                  {EMAIL_SIGNATURES.default.name}
                  <br />
                  Billing Team, {EMAIL_SIGNATURES.default.company}
                </strong>
              </Text>
            </Section>

            {/* Reusable Footer */}
            <EmailFooter
              recipientName={recipientName}
              supportTitle="Having trouble updating your payment?"
              supportMessage="Our billing support team is here to help. Contact us at"
            />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PaymentFailedEmail;
