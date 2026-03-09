import { Link, Text } from "@react-email/components";
import ArtistEmailLayout from "./ArtistEmailLayout";
import { auth_uri } from "@omenai/url-config/src/config";

const PriceReviewCompleted = (artist_name: string) => {
  return (
    <ArtistEmailLayout artist_name={artist_name}>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        Dear {artist_name},
      </Text>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        We’re pleased to let you know that your price review request has been
        fully reviewed. All the necessary information has been sent to your
        dashboard. Please log in to your artist account to view the detailed
        review results.
      </Text>

      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <Link
          href={`${auth_uri()}/login/artist`}
          style={{
            display: "inline-block",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "16px",
          }}
        >
          Login to your dashboard
        </Link>
      </div>

      <Text className="m-0 text-fluid-xxs font-semibold leading-[32px] text-gray-900">
        Thank you for your continued collaboration. We look forward to seeing
        your next steps on the platform.
      </Text>
    </ArtistEmailLayout>
  );
};

export default PriceReviewCompleted;
