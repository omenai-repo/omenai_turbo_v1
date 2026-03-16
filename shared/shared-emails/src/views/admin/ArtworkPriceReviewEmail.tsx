import { Text, Section, Button, Container } from "@react-email/components";
import AdminEmailLayout from "./AdminEmailLayout";
import { admin_url } from "@omenai/url-config/src/config";
import EmailFooter from "../../components/Footer";

interface ArtworkPriceReviewEmailProps {
  name: string;
  artwork_title: string;
  requested_price?: string;
}

const ArtworkPriceReviewEmail = ({
  name,
  artwork_title,
  requested_price,
}: ArtworkPriceReviewEmailProps) => {
  return (
    <AdminEmailLayout
      previewText="Action Required: New Artwork Price Review"
      showFooter={false}
    >
      <Container className="my-6">
        {/* Internal Alert Header */}
        <Text className="text-[#1a1a1a] text-base leading-relaxed font-bold">
          Review Team Alert,
        </Text>

        <Text className="text-[#4a4a4a] text-sm leading-relaxed mt-4">
          A new artwork pricing override request has been submitted and is
          currently waiting in the triage queue.
        </Text>

        {/* Quick Context Box */}
        <Section className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 my-6">
          <Text className="text-[#0f172a] text-sm font-bold m-0 mb-3 uppercase tracking-wider">
            Request Details
          </Text>
          <div className="space-y-5">
            <Text className="text-[#334155] text-sm m-0">
              <strong className="text-[#0f172a]">Artist:</strong> {name}
            </Text>
            <Text className="text-[#334155] text-sm m-0">
              <strong className="text-[#0f172a]">Artwork:</strong>{" "}
              {artwork_title}
            </Text>
            <Text className="text-[#334155] text-sm m-0">
              <strong className="text-[#0f172a]">Requested Price:</strong>{" "}
              {requested_price}
            </Text>
          </div>
        </Section>

        <Text className="text-[#4a4a4a] text-sm leading-relaxed mb-6">
          Please log in to the admin workspace to review the artist's proof of
          value and issue an approval, counter-offer, or decline within our
          standard 24-hour SLA.
        </Text>

        {/* Call to Action */}
        <Section className="mt-6 mb-8">
          <Button
            href={`${admin_url()}/admin/reviews`}
            className="bg-[#0f172a] text-white text-sm font-semibold py-3.5 px-6 rounded-lg text-center no-underline tracking-wide block w-fit"
          >
            Open Dashboard
          </Button>
        </Section>
      </Container>

      {/* Internal Admin Footer */}
      <EmailFooter recipientName="Omenai Admin" showSupportSection={false} />
    </AdminEmailLayout>
  );
};

export default ArtworkPriceReviewEmail;
