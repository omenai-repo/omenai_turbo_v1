import { Text, Section, Button, Container } from "@react-email/components";
import ArtistEmailLayout from "./ArtistEmailLayout";
import { auth_uri } from "@omenai/url-config/src/config";
import EmailFooter from "../../components/Footer";

interface PriceReviewCompletedProps {
  name: string;
  artwork_title: string;
}

const PriceReviewCompleted = ({
  name,
  artwork_title = "your recent artwork",
}: PriceReviewCompletedProps) => {
  return (
    <ArtistEmailLayout artist_name={name}>
      <Container className="my-6">
        {/* Greeting */}
        <Text className="text-[#1a1a1a] text-base leading-relaxed font-semibold">
          Hello {name},
        </Text>

        {/* Core Notification */}
        <Text className="text-[#4a4a4a] text-sm leading-relaxed mt-4">
          The pricing review for{" "}
          <span className="font-semibold text-[#1a1a1a]">{artwork_title}</span>{" "}
          has been completed by the Omenai curation team.
        </Text>

        <Text className="text-[#4a4a4a] text-sm leading-relaxed mt-4">
          We have carefully evaluated the market data and the context you
          provided. The final decision, along with any specific notes from our
          reviewers, is now available in your workspace.
        </Text>

        {/* Action Callout Box */}
        <Section className="bg-[#fffbeb] border border-[#fde68a] rounded-xl p-5 my-6">
          <Text className="text-[#92400e] text-sm font-semibold m-0 mb-2">
            Action may be required
          </Text>
          <Text className="text-[#b45309] text-sm leading-relaxed m-0">
            If our team has proposed a data-backed counter-offer, you will need
            to explicitly accept or decline it from your dashboard before your
            artwork can be published.
          </Text>
        </Section>

        {/* Call to Action */}
        <Section className="mt-8 mb-6">
          <Button
            href={`${auth_uri()}/login/artist`}
            className="bg-[#1a1a1a] text-white text-sm font-semibold py-3.5 px-6 rounded-lg text-center no-underline tracking-wide block w-fit"
          >
            Login to View Results
          </Button>
        </Section>
      </Container>
    </ArtistEmailLayout>
  );
};

export default PriceReviewCompleted;
