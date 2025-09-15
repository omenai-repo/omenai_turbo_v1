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
import { admin_url } from "@omenai/url-config/src/config";
interface RoleUpdateEmailProps {
  recipientName: string;
  previousRole: string;
  newRole: string;
  adminPortalUrl?: string;
  effectiveDate?: string;
  updatedBy?: string;
}

export const RoleUpdateEmail: React.FC<RoleUpdateEmailProps> = ({
  recipientName,
  previousRole,
  newRole,
  adminPortalUrl = `${admin_url()}/auth/login`,
  effectiveDate = "immediately",
  updatedBy = "System Administrator",
}) => {
  return (
    <Html>
      <Head />
      <Preview>Your admin portal role has been updated to {newRole}</Preview>
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

            {/* Notification Banner */}
            <Section className="bg-blue-50 px-8 py-4 border-b-4 border-blue-500">
              <Text
                className="text-center font-semibold m-0"
                style={{ color: EMAIL_COLORS.link, fontSize: "18px" }}
              >
                🔐 Admin Portal Role Update
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="px-8 py-8">
              <Text style={EMAIL_STYLES.text.base}>
                Dear <strong>{recipientName}</strong>,
              </Text>

              <Text style={EMAIL_STYLES.text.base}>
                This email confirms that your role on the {COMPANY_INFO.name}{" "}
                Admin Portal has been successfully updated. This change takes
                effect {effectiveDate}.
              </Text>

              {/* Role Change Details */}
              <Section className="my-8 p-6 bg-gray-50 rounded">
                <Text
                  style={{
                    ...EMAIL_STYLES.text.base,
                    marginBottom: "16px",
                    fontWeight: "600",
                  }}
                >
                  Role Update Details:
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
                        width: "140px",
                      }}
                    >
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          color: EMAIL_COLORS.gray[600],
                        }}
                      >
                        Previous Role:
                      </Text>
                    </td>
                    <td>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          color: EMAIL_COLORS.gray[600],
                          textDecoration: "line-through",
                        }}
                      >
                        {previousRole}
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingRight: "16px", verticalAlign: "top" }}>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          color: EMAIL_COLORS.success,
                          fontWeight: "600",
                        }}
                      >
                        New Role:
                      </Text>
                    </td>
                    <td>
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.base,
                          margin: "0",
                          color: EMAIL_COLORS.success,
                          fontWeight: "700",
                        }}
                      >
                        {newRole}
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        paddingRight: "16px",
                        verticalAlign: "top",
                      }}
                    >
                      <Text
                        style={{
                          ...EMAIL_STYLES.text.small,
                          margin: "0",
                          color: EMAIL_COLORS.gray[600],
                        }}
                      >
                        Updated By:
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
                        {updatedBy}
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
                        Effective:
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
                        {effectiveDate}
                      </Text>
                    </td>
                  </tr>
                </table>
              </Section>

              {/* Permissions Info */}
              <Section className="my-6 p-4 bg-blue-50 rounded border-l-4 border-blue-500">
                <Text
                  style={{
                    ...EMAIL_STYLES.text.small,
                    marginBottom: "0",
                    color: EMAIL_COLORS.link,
                  }}
                >
                  <strong>What this means:</strong> Your new role may include
                  different permissions and access levels within the admin
                  portal. Please log in to review your updated capabilities.
                </Text>
              </Section>

              <Text style={EMAIL_STYLES.text.base}>
                If you believe this change was made in error or have questions
                about your new permissions, please contact your administrator or
                our support team immediately.
              </Text>

              {/* CTA Button */}
              <Section className="text-center my-8">
                <Button
                  href={adminPortalUrl}
                  style={EMAIL_STYLES.button.primary}
                >
                  Access Admin Portal
                </Button>
              </Section>

              <Text style={EMAIL_STYLES.text.base}>
                Thank you for your continued contribution to {COMPANY_INFO.name}
                .
              </Text>

              <Text style={EMAIL_STYLES.text.base}>
                Best regards,
                <br />
                <strong>
                  {EMAIL_SIGNATURES.support.name}
                  <br />
                  {EMAIL_SIGNATURES.support.company}
                </strong>
              </Text>
            </Section>

            {/* Reusable Footer */}
            <EmailFooter
              recipientName={recipientName}
              supportTitle="Questions about your role change?"
              supportMessage="Our admin support team can help explain your new permissions and capabilities. Contact us at"
            />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default RoleUpdateEmail;
