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

interface MemberInviteEmailProps {
  token: string;
}

const MemberInviteEmail = ({ token }: MemberInviteEmailProps) => {
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
                src="https://fra.cloud.appwrite.io/v1/storage/buckets/68227462000f77619b04/files/68b8ccd6000dedf704d5/view?project=682273fc00235a5bdb6c"
                width="150"
                height="30"
                alt="Omenai"
                className="mx-auto"
              />
            </Section>

            {/* Welcome Badge */}
            <Section className="text-center mb-8">
              <div className="dark:text-white text-[#0f172a] text-sm font-semibold px-4 py-2 rounded-full">
                🎉 Admin Invitation
              </div>
            </Section>

            {/* Main Heading */}
            <Heading className="text-gray-900 dark:text-gray-100 text-2xl md:text-3xl font-bold text-center mb-6">
              Welcome to the team!
            </Heading>

            {/* Main Content */}
            <Text className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-4">
              You've been selected to join the{" "}
              <strong className="text-gray-900 dark:text-gray-100">
                Omenai
              </strong>{" "}
              admin team. This is an exclusive invitation to help shape the
              future of our platform.
            </Text>

            <Text className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-8">
              To get started, simply click the button below to activate your
              admin account and unlock your new capabilities.
            </Text>

            {/* CTA Button */}
            <Section className="text-center my-8">
              <Link
                href={`https://admin.omenai.app/activate?token=${token}`}
                className="bg-[#0f172a] border border-white text-white font-semibold py-3 px-8 rounded inline-block no-underline transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Activate Admin Account
              </Link>
            </Section>

            {/* Security Notice */}
            <Section className="bg-gray-50 dark:bg-gray-900 rounded p-4 mt-8 mb-6">
              <Text className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-0">
                <strong className="text-gray-700 dark:text-gray-300">
                  🔒 Security First
                </strong>
                <br />
                This invitation link is unique to you and will expire in 48
                hours. Please do not share it with anyone.
              </Text>
            </Section>

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

export default MemberInviteEmail;
