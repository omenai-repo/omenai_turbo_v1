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
                "https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/68d2ab83002025087b36/view?project=682272b1001e9d1609a8"
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
                href="mailto:contact@omenai.net"
                className="text-dark font-bold underline"
              >
                contact@omenai.net
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
            <Text className="text-dark text-[12px] leading-[24px]">
              Please be advised that the information contained within this email
              was directed exclusively to{" "}
              <span className="text-dark">{artist_name} </span>. In the event
              that you were not anticipating the receipt of this email, we
              respectfully request that you refrain from taking any action based
              on its contents. This communication may contain confidential and
              legally privileged information, and it is intended solely for the
              designated recipient. Unauthorized access, use, or dissemination
              of this email is strictly prohibited. If you have received this
              email in error, we kindly ask that you promptly inform us and
              delete it from your communication systems. Your prompt attention
              to this matter is greatly appreciated. Thank you
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
