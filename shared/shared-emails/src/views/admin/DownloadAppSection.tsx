import { Img, Link, Section, Text } from "@react-email/components";
import React from "react";

export default function DownloadAppSection() {
  return (
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
  );
}
