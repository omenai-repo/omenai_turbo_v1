import { Img, Link, Section, Text } from "@react-email/components";
import AdminEmailLayout from "./AdminEmailLayout";

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
      <Section
        style={{
          width: "100%",
          textAlign: "center",
        }}
      >
        <Text
          className="m-0 text-fluid-xxs font-semibold leading-[32px] text-gray-900"
          style={{ textAlign: "center" }}
        >
          Or download the app
        </Text>
        <table width="100%" cellPadding="0" cellSpacing="0" border={0}>
          <thead style={{ display: "none" }}>
            <tr>
              <th>App Store Download Links</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td align="center">
                <table
                  cellPadding="0"
                  cellSpacing="0"
                  border={0}
                  style={{ display: "inline-block" }}
                >
                  <thead style={{ display: "none" }}>
                    <tr>
                      <th>App Store</th>
                      <th>Google Play</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ paddingRight: "16px" }}>
                        <Link href="https://apps.apple.com/app/6748387089">
                          <Img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/320px-Download_on_the_App_Store_Badge.svg.png"
                            alt="Download on the App Store"
                            width="135"
                            height="40"
                            style={{
                              display: "block",
                              border: "0",
                              outline: "none",
                            }}
                          />
                        </Link>
                      </td>
                      <td style={{ paddingLeft: "16px" }}>
                        <Link href="https://play.google.com/store/apps/details?id=com.omenai.omenaiapp">
                          <Img
                            src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                            alt="Download on the Google Play"
                            width="160"
                            height="62"
                            style={{
                              display: "block",
                              border: "0",
                              outline: "none",
                            }}
                          />
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>
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
