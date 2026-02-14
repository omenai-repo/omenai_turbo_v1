import { Heading, Section, Text } from "@react-email/components";
import AdminEmailLayout from "./AdminEmailLayout";

interface NexusTresholdEmailProps {
  state: string;
}

const NexusTreshold = ({ state }: NexusTresholdEmailProps) => {
  const previewText = `Nexus Threshold Breach Notification`;

  return (
    <AdminEmailLayout previewText={previewText}>
      {/* Welcome Badge */}
      <Section className="text-center mb-8">
        <div className="dark:text-white text-[#0f172a] text-sm font-semibold px-4 py-2 rounded">
          Nexus Threshold Breach Notification
        </div>
      </Section>

      {/* Main Heading */}
      <Heading className="text-gray-900 dark:text-gray-100 text-2xl md:text-3xl font-bold text-center mb-6">
        Dear Administrator,
      </Heading>

      {/* Main Content */}
      <Text className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-4">
        This is to inform you that the sales nexus threshold has been exceeded
        in the state of {state}. Based on the latest transactional data, total
        sales and/or transaction volume within this jurisdiction have surpassed
        the state’s registration threshold for tax collection obligations.
      </Text>

      <Text className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-8">
        Please initiate the necessary registration procedures at the earliest
        convenience. Once registration is complete, the new tax collection
        parameters should be updated within the system to ensure accurate
        calculation and remittance moving forward.
      </Text>
    </AdminEmailLayout>
  );
};

export default NexusTreshold;
