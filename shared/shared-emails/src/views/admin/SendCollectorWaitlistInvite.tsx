import { Img, Link, Section, Text } from "@react-email/components";
import AdminEmailLayout from "./AdminEmailLayout";
import DownloadAppSection from "./DownloadAppSection";

const SendCollectorWaitlistInvite = (name: string) => {
  return (
    <AdminEmailLayout
      name={name}
      previewText="We're
        excited to let you know that OMENAI is now officially live!"
      showFooter={false}
    >
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        Dear {name},
      </Text>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        OMENAI is now live.
      </Text>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        Discover and collect contemporary African art through a curated digital
        platform connecting leading artists across Africa and its diaspora with
        collectors worldwide.
      </Text>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        Browse featured works, new arrivals, and limited editions now available.
      </Text>
      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <Link
          href={`https://auth.omenai.app/register/user`}
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
        Questions about a specific work?
      </Text>
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
        Contact OMENAI Advisory at{" "}
        <Link
          href={`mailto:advisory@omenai.app`}
          className="footer-link"
          style={{
            color: "#111827",
            fontWeight: "500",
            textDecoration: "none",
            borderBottom: "1px solid #d1d5db",
          }}
        >
          advisory@omenai.app
        </Link>
      </Text>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        We look forward to welcoming you.
      </Text>
      <Text className="text-fluid-xxs leading-[24px]">The OMENAI team</Text>
    </AdminEmailLayout>
  );
};

export default SendCollectorWaitlistInvite;
