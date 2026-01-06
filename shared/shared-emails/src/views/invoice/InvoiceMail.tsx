import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

type InvoiceTestEmailProps = {
  name: string;
};

export default function InvoiceMail({ name }: InvoiceTestEmailProps) {
  return (
    <Html>
      <Head />

      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto my-12 max-w-[520px] rounded-lg bg-white px-8 py-10 shadow-sm">
            {/* Logo */}
            <Section className="mb-10 text-center">
              <Img
                src="https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/68d2ab83002025087b36/view?project=682272b1001e9d1609a8"
                width="120"
                height="32"
                alt="Omenai"
                className="mx-auto"
              />
            </Section>

            {/* Title */}
            <Heading className="mb-6 text-center text-2xl font-medium text-gray-900">
              Thank you for your purchase
            </Heading>

            {/* Body copy */}
            <Text className="mb-4 text-gray-700">Hi {name},</Text>

            <Text className="mb-4 text-gray-700">
              We’re happy to let you know that your transaction was successful.
              Your receipt has been generated and is attached to this email as a
              PDF for your records.
            </Text>

            <Text className="mb-8 text-gray-700">
              At Omenai, every purchase directly supports independent artists
              and galleries around the world — thank you for being part of that
              journey.
            </Text>

            {/* Receipt notice box */}
            <Section className="rounded-md bg-gray-50 px-6 py-4">
              <Text className="text-sm text-gray-600">
                📎{" "}
                <span className="font-medium text-gray-800">
                  Receipt attached
                </span>
              </Text>
              <Text className="mt-1 text-sm text-gray-600">
                This email includes a PDF invoice detailing your transaction.
                Please keep it for your records.
              </Text>
            </Section>

            {/* Support */}
            <Text className="mt-8 text-gray-700">
              If you have any questions about this invoice or need further
              assistance, feel free to contact our support team at{" "}
              <span className="font-medium">support@omenai.app</span>.
            </Text>

            {/* Sign-off */}
            <Text className="mt-10 text-sm text-gray-500">
              — The Omenai Team
            </Text>
          </Container>

          {/* Footer */}
          <Container className="mx-auto max-w-[520px] px-8">
            <Text className="mt-6 text-center text-xs text-gray-400">
              This is an automated message. Please do not reply to this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
