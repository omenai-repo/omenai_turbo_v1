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
  Tailwind,
  Text,
} from "@react-email/components";

const OrderDeclinedWarning = (name: string) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Img
              src={
                "https://fra.cloud.appwrite.io/v1/storage/buckets/66aa1aa0001a0c51d892/files/68028808001793765300/view?project=66aa198b0038ad614178&mode=admin"
              }
              width="120"
              height="20"
              alt="Omenai logo"
              className="mx-auto mt-10"
            />

            <Text className="text-black text-[14px] leading-[24px]">
              Hello <strong>{name}</strong>,
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              I hope this email finds you well. <br />
              We wanted to bring to your attention that there are pending order
              requests associated with your gallery that have not yet received a
              response. If these orders remain unacknowledged, they will be
              subject to automatic decline within the next 24 hours.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              To avoid any inconvenience and ensure a smooth experience for your
              customers, we encourage you to review and respond to the pending
              requests at your earliest convenience.
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              If you have any questions or require further assistance, please
              don't hesitate to reach out to us at{" "}
              <Link
                href="mailto:contact@omenani.net"
                className="underline text-blue-800 italic"
              >
                contact@omeani.net
              </Link>
              . We value your partnership and appreciate your prompt attention
              to this matter.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Thank you for your understanding and continued support of our
              platform
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Best regards, <br />
              Moses from Omenai
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-gray-700 text-[12px] leading-[24px]">
              Please be advised that the information contained within this email
              was directed exclusively to{" "}
              <span className="text-black">{name} </span>. In the event that you
              were not anticipating the receipt of this email, we respectfully
              request that you refrain from taking any action based on its
              contents. This communication may contain confidential and legally
              privileged information, and it is intended solely for the
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
};

export default OrderDeclinedWarning;
