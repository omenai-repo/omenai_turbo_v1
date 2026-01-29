import { auth_uri } from "@omenai/url-config/src/config";
import { Img, Link, Section, Text } from "@react-email/components";
import AdminEmailLayout from "./AdminEmailLayout";

const SendWaitListInvites = (name: string, email: string, entity: string) => {
  return (
    <AdminEmailLayout
      name={name}
      previewText="We're
        excited to let you know that our application is now officially live!"
    >
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        Dear {name},
      </Text>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        Thank you for your patience while you were on our waitlist. We're
        excited to let you know that our application is now officially live!
      </Text>
      <Text className="text-dark text-fluid-xxs leading-[24px]">
        You can now create your account and start exploring everything we've
        built for you.
      </Text>
      <Text className="m-0 text-fluid-xxs font-semibold leading-[32px] text-gray-900">
        Ready to see what all the hype is about?
      </Text>
      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <Link
          href={`${auth_uri()}/register/${entity === "collector" ? "user" : entity}`}
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
          Register Now
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
          Or
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
                        <Link href="https://apps.apple.com/app/omenai">
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
      {entity === "artist" ? (
        <Text className="text-fluid-xxs text-center leading-[24px]">
          We look forward to seeing your beautiful creations!
        </Text>
      ) : (
        <Text className="text-fluid-xxs text-center leading-[24px]">
          We can't wait for you to dive in!
        </Text>
      )}
      <br />
      <Text className="text-fluid-xxs leading-[24px]">
        Best regards, <br /> The Omenai team
      </Text>
    </AdminEmailLayout>
  );
};

export default SendWaitListInvites;
