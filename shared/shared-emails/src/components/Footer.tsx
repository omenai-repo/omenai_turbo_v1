import { Section, Text, Row, Column, Img, Link } from "@react-email/components";
import * as React from "react";
import { EMAIL_STYLES, COMPANY_INFO } from "../constants/constants";

interface EmailFooterProps {
  recipientName?: string;
  showSupportSection?: boolean;
  supportTitle?: string;
  supportMessage?: string;
}

export const EmailFooter: React.FC<EmailFooterProps> = ({
  recipientName,
  showSupportSection = true,
  supportTitle = "Need assistance?",
  supportMessage = "Our support team is here to help. Feel free to reach out at",
}) => {
  return (
    <>
      {/* Support Section */}
      {showSupportSection && (
        <Section className="my-8 mx-8 p-6 bg-gray-50 rounded">
          <Text style={{ ...EMAIL_STYLES.text.base, marginBottom: "8px" }}>
            <strong>{supportTitle}</strong>
          </Text>
          <Text style={{ ...EMAIL_STYLES.text.small, marginBottom: "0" }}>
            {supportMessage}{" "}
            <Link
              href={`mailto:${COMPANY_INFO.email}`}
              style={EMAIL_STYLES.link}
            >
              {COMPANY_INFO.email}
            </Link>
            {supportMessage.includes("questions")
              ? "."
              : " with any questions or concerns."}
          </Text>
        </Section>
      )}

      {/* Footer Section */}
      <Section className="px-8 py-6 bg-gray-50 border-t border-gray-200">
        <Row>
          <Column>
            <Img
              src={COMPANY_INFO.logo}
              width="100"
              height="20"
              alt={`${COMPANY_INFO.name} logo`}
              className="mb-4"
            />
            <Text style={EMAIL_STYLES.text.small} className="m-0">
              {COMPANY_INFO.address}
            </Text>
            <Text style={EMAIL_STYLES.text.small} className="m-0">
              {COMPANY_INFO.email}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Legal Notice */}
      <Section className="px-8 py-4 bg-gray-100">
        <Text style={EMAIL_STYLES.text.tiny} className="text-center m-0">
          This email is intended solely for <strong>{recipientName}</strong> and
          may contain confidential information. If you received this message in
          error, please notify us immediately and delete it from your system.
          Unauthorized use or distribution is prohibited.
        </Text>
      </Section>
    </>
  );
};

export default EmailFooter;
