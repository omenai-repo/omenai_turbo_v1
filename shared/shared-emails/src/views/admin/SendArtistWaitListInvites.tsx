import { Img, Link, Section, Text } from "@react-email/components";
import AdminEmailLayout from "./AdminEmailLayout";
import DownloadAppSection from "./DownloadAppSection";

const SendArtistWaitListInvites = (name: string) => {
  return (
    <AdminEmailLayout
      name={name}
      previewText="OMENAI is Live — Activate Your Profile"
      showFooter={false}
    >
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        Dear {name},
      </Text>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        OMENAI is now live.
      </Text>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        Our curated platform connects contemporary African artists with a global
        collector audience.
      </Text>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        Create your account to begin sharing your work, building your profile,
        and reaching collectors worldwide.
      </Text>
      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <Link
          href={`https://auth.omenai.app/register/artist`}
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
          Create Your Account
        </Link>
      </div>
      <DownloadAppSection />
      <br />
      <Text
        className="footer-text-main"
        style={{
          margin: "0 0 8px 0",
          fontSize: "14px",
          fontWeight: "600",
          color: "#111827",
          letterSpacing: "0.3px",
        }}
      >
        For onboarding support, contact{" "}
        <Link
          href={`mailto:onboarding@omenai.app`}
          className="footer-link"
          style={{
            color: "#111827",
            fontWeight: "500",
            textDecoration: "none",
            borderBottom: "1px solid #d1d5db",
          }}
        >
          onboarding@omenai.app
        </Link>
      </Text>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        We’re excited to have you join the platform.
      </Text>
      <Text className="text-fluid-xxs leading-[24px]">The OMENAI team</Text>
    </AdminEmailLayout>
  );
};

export default SendArtistWaitListInvites;
