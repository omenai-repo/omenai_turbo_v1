import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
} from "@react-email/components";
import React from "react";
import EmailFooter from "../../components/Footer";

export default function AdminEmailLayout({
  name,
  previewText,
  children,
}: {
  name?: string;
  previewText: string;
  children: React.ReactNode;
}) {
  return (
    <Html>
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Head />
        <Body className="bg-gray-50 dark:bg-gray-900 my-auto mx-auto font-sans px-2">
          <Container className="bg-white dark:bg-gray-800 border border-solid border-gray-200 dark:border-gray-700 rounded shadow-lg my-[40px] mx-auto p-[32px] max-w-[580px] w-full">
            {/* Logo Section */}
            <Section className="text-center mb-8">
              <Img
                src={
                  "https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/696ee3b60025e2a2c4ff/view?project=682272b1001e9d1609a8"
                }
                width="150"
                height="30"
                alt="Omenai"
                className="mx-auto"
              />
            </Section>

            {children}
          </Container>

          {/* Help Section Outside Container */}
          <EmailFooter recipientName={name} />
        </Body>
      </Tailwind>
    </Html>
  );
}
