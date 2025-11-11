import { admin_url } from "@omenai/url-config/src/config";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface ActivateAdminEmailProps {
  name: string;
}

const ActivateAdminEmail = ({ name }: ActivateAdminEmailProps) => {
  const previewText = `You're invited to join the Omenai admin team`;

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
                src="https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/68d2ab83002025087b36/view?project=682272b1001e9d1609a8"
                width="150"
                height="30"
                alt="Omenai"
                className="mx-auto"
              />
            </Section>

            {/* Welcome Badge */}
            <Section className="text-center mb-8">
              <div className="dark:text-white text-[#0f172a] text-sm font-semibold px-4 py-2 rounded-full">
                🎉 You are now an Admin
              </div>
            </Section>

            {/* Main Heading */}
            <Heading className="text-gray-900 dark:text-gray-100 text-2xl md:text-3xl font-bold text-center mb-6">
              Welcome to the team, {name}!
            </Heading>

            {/* Main Content */}
            <Text className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-4">
              Welcome aboard the{" "}
              <strong className="text-gray-900 dark:text-gray-100">
                Omenai
              </strong>{" "}
              admin team. Your account has been successfully activated with
              admin access. You can now log in and start managing the admin side
              of the application.
            </Text>

            <Text className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-8">
              We’re glad to have you on the team — let’s make great things
              happen!
            </Text>

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
            <Text className="text-gray-500 dark:text-gray-500 text-xs">
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
};

export default ActivateAdminEmail;
