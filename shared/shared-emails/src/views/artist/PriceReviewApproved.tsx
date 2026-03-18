import { Text, Section, Button, Container } from "@react-email/components";
import ArtistEmailLayout from "./ArtistEmailLayout";
import EmailFooter from "../../components/Footer";

interface PriceReviewApprovedProps {
  name: string;
  artwork_title: string;
}

const PriceReviewApproved = ({
  name,
  artwork_title = "your recent artwork",
}: PriceReviewApprovedProps) => {
  return (
    <ArtistEmailLayout artist_name={name}>
      <Container className="my-6">
        {/* Greeting */}
        <Text className="text-[#1a1a1a] text-base leading-relaxed font-semibold">
          Hello {name},
        </Text>

        {/* Core Notification */}
        <Text className="text-[#4a4a4a] text-sm leading-relaxed mt-4">
          We are pleased to inform you that the Omenai review team has
          officially approved your pricing override request for{" "}
          <span className="font-semibold text-[#1a1a1a]">{artwork_title}</span>.
        </Text>

        <Text className="text-[#4a4a4a] text-sm leading-relaxed mt-4">
          The market data and justification you provided successfully met our
          platform's valuation standards. Your requested listing price has been
          finalized and locked in.
        </Text>

        {/* Success / Live Box */}
        <Section className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-5 my-6">
          <Text className="text-[#166534] text-sm font-semibold m-0 mb-2">
            Your artwork is now live
          </Text>
          <Text className="text-[#15803d] text-sm leading-relaxed m-0">
            The piece has been successfully published to the global marketplace
            and is now actively available for our network of collectors to
            explore and acquire.
          </Text>
        </Section>
      </Container>
    </ArtistEmailLayout>
  );
};

export default PriceReviewApproved;
