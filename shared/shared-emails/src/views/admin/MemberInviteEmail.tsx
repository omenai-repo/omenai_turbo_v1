import { admin_url } from "@omenai/url-config/src/config";
import { Heading, Link, Section, Text } from "@react-email/components";
import AdminEmailLayout from "./AdminEmailLayout";

interface MemberInviteEmailProps {
  token: string;
}

const MemberInviteEmail = ({ token }: MemberInviteEmailProps) => {
  const previewText = `You're invited to join the Omenai admin team`;

  return (
    <AdminEmailLayout previewText={previewText}>
      {/* Welcome Badge */}
      <Section className="text-center mb-8">
        <div className="dark:text-white text-[#0f172a] text-sm font-semibold px-4 py-2 rounded">
          🎉 Admin Invitation
        </div>
      </Section>

      {/* Main Heading */}
      <Heading className="text-gray-900 dark:text-gray-100 text-2xl md:text-3xl font-bold text-center mb-6">
        Welcome to the team!
      </Heading>

      {/* Main Content */}
      <Text className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-4">
        You've been selected to join the{" "}
        <strong className="text-gray-900 dark:text-gray-100">Omenai</strong>{" "}
        admin team. This is an exclusive invitation to help shape the future of
        our platform.
      </Text>

      <Text className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-8">
        To get started, simply click the button below to activate your admin
        account and unlock your new capabilities.
      </Text>

      {/* CTA Button */}
      <Section className="text-center my-8">
        <Link
          href={`${admin_url()}/activate?token=${token}`}
          className="bg-[#0f172a] border border-white text-white font-semibold py-3 px-8 rounded inline-block no-underline transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Activate Admin Account
        </Link>
      </Section>

      {/* Security Notice */}
      <Section className="bg-gray-50 dark:bg-gray-900 rounded p-4 mt-8 mb-6">
        <Text className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-0">
          <strong className="text-gray-700 dark:text-gray-300">
            🔒 Security First
          </strong>
          <br />
          This invitation link is unique to you and will expire in 48 hours.
          Please do not share it with anyone.
        </Text>
      </Section>
    </AdminEmailLayout>
  );
};

export default MemberInviteEmail;
