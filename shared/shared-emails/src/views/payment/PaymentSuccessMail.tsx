import { getApiUrl } from "@omenai/url-config/src/config";
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

const PaymentSuccessfulMail = (
  name: string,
  artwork: string,
  price: string,
  order_id: string,
  order_date: string,
  transaction_Id: string
) => {
  const url = getApiUrl();
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Img
              src={
                "https://cloud.appwrite.io/v1/storage/buckets/66aa1aa0001a0c51d892/files/679292dc001c0e14f322/view?project=66aa198b0038ad614178&project=66aa198b0038ad614178&mode=admin"
              }
              width="100"
              height="20"
              alt="Omenai logo"
              className="mx-auto mt-10"
            />

            <Heading className="text-black text-[20px] font-normal  p-0 mb-[40px] mx-0">
              ARTWORK PURCHASE SUCCESSFUL
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              <strong>Dear {name},</strong>
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              We're thrilled to inform you that we have received your payment
              for <strong>(Order ID #{order_id})</strong>
            </Text>
            <div className="w-fit p-5 bg-dark text-white border border-t-8 border-t-white flex">
              <div className="">
                <Text className="font-bold">Receipt from Omenai Inc.</Text>
                <Text>
                  Your payment was successful and has been received by Omenai
                  Inc.
                </Text>
                <h1 className="text-bold text-xl">{price}</h1>

                <Hr className="border-[#FAFAFA] my-5" />

                <div className="w-full">
                  <Text className="uppercase text-center">PAYMENT DETAILS</Text>

                  <div className="py-2 w-full">
                    <div className="flex gap-x-1 items-center">
                      <Text>Artwork Name:</Text>
                      <Text className="font-bold">{artwork}</Text>
                    </div>
                    <div className="flex gap-x-1 items-center">
                      <Text>Amount Paid:</Text>
                      <Text className="font-bold">{price}</Text>
                    </div>
                    <div className="flex gap-x-1 items-center">
                      <Text>Transaction ID:</Text>
                      <Text className="font-bold">{transaction_Id}</Text>
                    </div>
                    <div className="flex gap-x-1 items-center">
                      <Text>Date:</Text>
                      <Text className="font-bold">{order_date}</Text>
                    </div>
                  </div>
                </div>
                <Hr className="border-[#FAFAFA] my-5" />
              </div>
            </div>

            <div>
              <Text className="font-bold">What happens next:</Text>
              <ul className="gap-y-4 text-[14px] leading-[24px]">
                <li>
                  You can track your order status by visiting your{" "}
                  <Link
                    href={`${url}/dashboard/user/orders`}
                    className="underline text-dark italic font-bold"
                  >
                    Account Page
                  </Link>
                </li>
                <li>
                  We will send you a tracking ID and a tracking link once your
                  order ships.{" "}
                </li>
              </ul>
            </div>

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

export default PaymentSuccessfulMail;
