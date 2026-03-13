import { Section, Text, Img, Link, Hr } from "@react-email/components";
import * as React from "react";
import { COMPANY_INFO } from "../constants/constants";

interface EmailFooterProps {
  recipientName?: string;
  showSupportSection?: boolean;
  supportTitle?: string;
  supportMessage?: string;
}

export const EmailFooter: React.FC<EmailFooterProps> = ({
  recipientName = "Valued Collector",
  showSupportSection = true,
  supportTitle = "Omenai Advisory",
  supportMessage = "Our advisory team is available to assist you. Reach out at",
}) => {
  return (
    <>
      <style>
        {`
          @media (prefers-color-scheme: dark) {
            .footer-divider { border-color: #374151 !important; }
            .footer-support-box { background-color: #111827 !important; border-color: #374151 !important; }
            .footer-text-main { color: #d1d5db !important; }
            .footer-text-muted { color: #6b7280 !important; }
            .footer-text-tiny { color: #4b5563 !important; }
            .footer-link { color: #ffffff !important; text-decoration: underline !important; }
          }
        `}
      </style>

      {/* Support Section */}
      {showSupportSection && (
        <Section
          className="footer-support-box"
          style={{
            margin: "32px auto 0",
            padding: "24px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            textAlign: "center",
            maxWidth: "560px",
          }}
        >
          <Text
            className="footer-text-main"
            style={{
              margin: "0 0 8px 0",
              fontSize: "15px",
              fontWeight: "600",
              color: "#111827",
              letterSpacing: "0.3px",
            }}
          >
            {supportTitle}
          </Text>
          <Text
            className="footer-text-muted"
            style={{
              margin: "0",
              fontSize: "14px",
              lineHeight: "1.6",
              color: "#4b5563",
            }}
          >
            {supportMessage} <br />
            <Link
              href={`mailto:${COMPANY_INFO.email}`}
              className="footer-link"
              style={{
                color: "#111827",
                fontWeight: "500",
                textDecoration: "none",
                borderBottom: "1px solid #d1d5db",
              }}
            >
              {COMPANY_INFO.email}
            </Link>
            .
          </Text>
        </Section>
      )}

      {/* Main Footer & Identity */}
      <Section style={{ padding: "40px 20px 20px", textAlign: "center" }}>
        <Img
          src={COMPANY_INFO.logo}
          width="120"
          height="auto"
          alt={`${COMPANY_INFO.name} Logo`}
          style={{ margin: "0 auto 24px", display: "block" }}
        />
        <Text
          className="footer-text-muted"
          style={{
            margin: "0 0 8px 0",
            fontSize: "13px",
            color: "#6b7280",
            letterSpacing: "0.5px",
          }}
        >
          {COMPANY_INFO.address}
        </Text>
        <Text
          className="footer-text-muted"
          style={{ margin: "0", fontSize: "13px", color: "#6b7280" }}
        >
          {COMPANY_INFO.email}
        </Text>
      </Section>

      <Hr
        className="footer-divider"
        style={{
          borderColor: "#f3f4f6",
          margin: "16px auto",
          width: "100%",
          maxWidth: "560px",
        }}
      />

      {/* Legal Notice */}
      <Section style={{ padding: "0 20px 32px", textAlign: "center" }}>
        <Text
          className="footer-text-tiny"
          style={{
            margin: "0",
            fontSize: "11px",
            lineHeight: "1.6",
            color: "#9ca3af",
            maxWidth: "480px",
            display: "inline-block",
          }}
        >
          This communication is intended securely for{" "}
          <strong style={{ fontWeight: "500" }}>{recipientName}</strong> and may
          contain confidential information. If you received this message in
          error, please notify us immediately. Unauthorized distribution is
          prohibited.
        </Text>
      </Section>
    </>
  );
};

export default EmailFooter;
