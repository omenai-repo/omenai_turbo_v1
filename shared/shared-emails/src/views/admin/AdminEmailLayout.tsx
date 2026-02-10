import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import React from "react";

export default function AdminEmailLayout({
  previewText,
  children,
}: {
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

            {/* Divider */}
            <Hr className="border-gray-200 dark:border-gray-700 my-8" />

            {/* Footer */}
            <Section>
              <Text className="text-gray-400 dark:text-gray-600 text-xs leading-relaxed">
                © {new Date().getFullYear()} Omenai. All rights reserved.
                <br />
                <Link
                  href="https://omenai.com"
                  className="text-gray-400 dark:text-gray-600 underline"
                >
                  omenai.com
                </Link>{" "}
                •
                <Link
                  href="https://omenai.com/privacy"
                  className="text-gray-400 dark:text-gray-600 underline ml-1"
                >
                  Privacy Policy
                </Link>{" "}
                •
                <Link
                  href="https://omenai.com/terms"
                  className="text-gray-400 dark:text-gray-600 underline ml-1"
                >
                  Terms of Service
                </Link>
              </Text>
            </Section>
          </Container>

          {/* Help Section Outside Container */}
          <Container className="text-center mt-8 mb-4">
            <Text className="text-slate-700 dark:text-slate-700 text-xs">
              Need help?{" "}
              <Link
                href="mailto:support@omenai.com"
                className="text-purple-600 dark:text-purple-400 no-underline"
              >
                Contact our support team
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
