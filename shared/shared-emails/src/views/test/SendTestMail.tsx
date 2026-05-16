import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface TestEmailProps {
  name: string;
  cta: string;
}

const SendTestMail = ({ name, cta }: TestEmailProps) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-[#FAFAFA] my-auto mx-auto font-sans text-zinc-900">
          <Container className="border border-solid border-zinc-200 bg-white rounded-md my-[60px] mx-auto p-[40px] w-[500px] shadow-sm">
            <Img
              src="https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/696ee3b60025e2a2c4ff/view?project=682272b1001e9d1609a8"
              width="120"
              height="20"
              alt="Omenai logo"
              className="mx-auto mt-4 mb-8"
            />

            <Hr className="border border-solid border-zinc-100 my-[20px] mx-0 w-full" />

            <Heading className="text-zinc-900 text-[22px] font-normal text-center p-0 mb-[30px] mt-[20px] mx-0 tracking-tight">
              Artwork Access
            </Heading>

            <Text className="text-zinc-700 text-[14px] leading-[24px]">
              Hello {name},
            </Text>

            <Text className="text-zinc-700 text-[14px] leading-[24px]">
              Please use the secure link below to proceed to the platform and
              view the requested artwork details.
            </Text>

            {/* Upgraded to a structured Section and Button for better email client rendering */}
            <Section className="text-center mt-[36px] mb-[36px]">
              <Button
                className="bg-black rounded-sm text-white text-[13px] font-medium no-underline text-center px-6 py-3.5"
                href={cta}
              >
                View Artwork Securely
              </Button>
            </Section>

            <Hr className="border border-solid border-zinc-100 my-[20px] mx-0 w-full" />

            <Text className="text-zinc-500 text-[12px] leading-[20px] text-center">
              If you did not request this link, there is nothing to worry about
              — you can safely ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default SendTestMail;
