import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Tailwind,
  Text,
} from "@react-email/components";
import React from "react";
import EmailFooter from "../../components/Footer";

export default function ArtistEmailLayout({
  artist_name,
  children,
}: {
  artist_name: string;
  children: React.ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Img
              src={
                "https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/696ee3b60025e2a2c4ff/view?project=682272b1001e9d1609a8"
              }
              width="120"
              height="20"
              alt="Omenai logo"
              className="mx-auto my-10"
            />

            {children}

            <Text className="text-fluid-xxs leading-[24px]">
              If you have any questions or need assistance, feel free to reach
              out to us at{" "}
              <Link
                href="mailto:support@omenai.app"
                className="text-dark font-bold underline"
              >
                support@omenai.app
              </Link>
            </Text>
            <Text className="text-fluid-xxs leading-[24px]">
              We look forward to seeing your beautiful creations!
            </Text>
            <br />
            <Text className="text-fluid-xxs leading-[24px]">
              Best regards, <br /> The Omenai team
            </Text>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <EmailFooter
              recipientName={artist_name}
              showSupportSection={false}
            />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
