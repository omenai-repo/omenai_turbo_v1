import { Heading, Section, Text } from "@react-email/components";
import AdminEmailLayout from "./AdminEmailLayout";

interface ActivateAdminEmailProps {
  name: string;
}

const ActivateAdminEmail = ({ name }: ActivateAdminEmailProps) => {
  const previewText = `You are now an Admin`;

  return (
    <AdminEmailLayout previewText={previewText}>
      {/* Welcome Badge */}
      <Section className="text-center mb-8">
        <div className="dark:text-white text-[#0f172a] text-sm font-semibold px-4 py-2 rounded-full">
          🎉 You are now an Admin
        </div>
      </Section>

      {/* Main Heading */}
      <Heading className="text-gray-900 dark:text-gray-100 text-2xl md:text-3xl font-bold text-center mb-6">
        Welcome to the team, {name}!
      </Heading>

      {/* Main Content */}
      <Text className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-4">
        Welcome aboard the{" "}
        <strong className="text-gray-900 dark:text-gray-100">Omenai</strong>{" "}
        admin team. Your account has been successfully activated with admin
        access. You can now log in and start managing the admin side of the
        application.
      </Text>

      <Text className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-8">
        We’re glad to have you on the team — let’s make great things happen!
      </Text>
    </AdminEmailLayout>
  );
};

export default ActivateAdminEmail;
