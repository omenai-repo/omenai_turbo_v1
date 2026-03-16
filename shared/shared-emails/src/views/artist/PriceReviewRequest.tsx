import { Text, Section, Button, Hr, Container } from "@react-email/components";
import ArtistEmailLayout from "./ArtistEmailLayout";
import EmailFooter from "../../components/Footer";

interface PriceReviewRequestProps {
  name: string;
  artwork_title: string;
}

const PriceReviewRequest = ({
  name,
  artwork_title = "your recent artwork",
}: PriceReviewRequestProps) => {
  return (
    <ArtistEmailLayout artist_name={name}>
      <Container className="my-6">
        {/* Greeting */}
        <Text className="text-[#1a1a1a] text-base leading-relaxed font-semibold">
          Hello {name},
        </Text>

        {/* Core Acknowledgment */}
        <Text className="text-[#4a4a4a] text-sm leading-relaxed mt-4">
          We have successfully received your pricing override request for{" "}
          <span className="font-semibold text-[#1a1a1a]">{artwork_title}</span>.
        </Text>

        <Text className="text-[#4a4a4a] text-sm leading-relaxed mt-4">
          Our review team is currently reviewing the market data and
          justifications you provided. We are committed to maintaining pricing
          integrity across the platform while ensuring your work is valued
          accurately.
        </Text>

        {/* Highlighted Next Steps Box */}
        <Section className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-5 my-6">
          <Text className="text-[#1a1a1a] text-sm font-semibold m-0 mb-2">
            What happens next?
          </Text>
          <Text className="text-[#4a4a4a] text-sm leading-relaxed m-0">
            You will receive a response from our team within{" "}
            <strong>24 hours</strong>. This will include either an approval, a
            data-backed counter-offer, or a request for additional context.
          </Text>
        </Section>

        <Text className="text-[#4a4a4a] text-sm leading-relaxed m-0">
          You can track your request status via your dashboard or mobile app.
        </Text>

        <Hr className="border-[#e5e7eb] my-8" />
      </Container>
    </ArtistEmailLayout>
  );
};

export default PriceReviewRequest;
