import { getApiUrl } from "@omenai/url-config/src/config.ts";
import {
  Body,
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

const PaymentFailedMail = (name: string, artwork: string, order_id: string) => {
  const url = getApiUrl();
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Img
              src={
                "https://cloud.appwrite.io/v1/storage/buckets/66aa1aa0001a0c51d892/files/66d988de000cf7f960c3/view?project=66aa198b0038ad614178&project=66aa198b0038ad614178&mode=admin"
              }
              width="100"
              height="20"
              alt="Omenai logo"
              className="mx-auto mt-10"
            />

            <Heading className="text-black text-[20px] font-normal text-center p-0 mb-[40px] mx-0">
              PURCHASE PAYMENT FAILED
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              <strong>Dear {name},</strong>
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Thank you for your recent order of{" "}
              <Link
                href={`${url}/artwork/${artwork}`}
                className="underline text-dark italic font-bold"
              >
                {artwork}
              </Link>{" "}
              We appreciate your business.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              We're reaching out to let you know that we encountered an issue
              processing your payment for{" "}
              <strong>(Order ID #{order_id})</strong>. This could be due to
              several reasons, such as expired card information or insufficient
              funds.
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              To ensure you receive your order for{" "}
              <Link
                href={`${url}/artwork/${artwork}`}
                className="underline text-dark italic font-bold"
              >
                {artwork}
              </Link>{" "}
              as soon as possible, we kindly ask you retry payment for this
              artwork. You can do this easily by following these steps:
            </Text>

            <div>
              <ul className="gap-y-4 text-[14px] leading-[24px]">
                <li>Login to your Omenai account. </li>
                <li>
                  Visit the orders tab on your dashboard and click the Pay
                  button on this order.
                </li>
              </ul>
            </div>

            <Text className="text-black text-[14px] leading-[24px]">
              Once we receive a successful payment, your order for{" "}
              <Link
                href={`${url}/artwork/${artwork}`}
                className="underline text-dark italic font-bold"
              >
                {artwork}
              </Link>{" "}
              will be confirmed and processed immediately. We'll send you a
              confirmation email with next steps.
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              As always, if you have any questions, feedback, or concerns
              regarding your Order or any other aspect of our service, please
              feel free to reach out to us at{" "}
              <Link
                href="mailto:contact@omenani.net"
                className="underline text-dark italic font-bold"
              >
                contact@omeani.net
              </Link>
              . Our dedicated customer support team is available to assist you
              and ensure your experience remains exceptional.{" "}
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Once again, thank you for choosing <strong>Omenai Inc.</strong> We
              appreciate your business and look forward to serving you.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Best regards, <br />
              Moses from Omenai
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-dark text-[12px] leading-[24px]">
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

export default PaymentFailedMail;
