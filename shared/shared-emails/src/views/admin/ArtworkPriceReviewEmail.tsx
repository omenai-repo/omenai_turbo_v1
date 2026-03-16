import { Img, Link, Section, Text } from "@react-email/components";
import AdminEmailLayout from "./AdminEmailLayout";
import DownloadAppSection from "./DownloadAppSection";
import { admin_url } from "@omenai/url-config/src/config";

const ArtworkPriceReviewEmail = (name: string) => {
  return (
    <AdminEmailLayout
      name={name}
      previewText="New Artwork Price Review Request"
      showFooter={true}
    >
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        Dear {name},
      </Text>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        A new artwork price review request has just been submitted. Please log
        in to the admin dashboard to view the details and attend to it at your
        earliest convenience.
      </Text>
      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <Link
          href={`${admin_url()}/auth/login`}
          style={{
            display: "inline-block",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "4px",
            textDecoration: "none",
            fontSize: "16px",
          }}
        >
          Login to your admin account
        </Link>
      </div>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        Thank you for keeping the review process running smoothly.
      </Text>
      <Text className="text-fluid-xxs leading-[24px]">The OMENAI team</Text>
    </AdminEmailLayout>
  );
};

export default ArtworkPriceReviewEmail;
