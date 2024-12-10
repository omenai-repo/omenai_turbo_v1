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

const PaymentSuccessfulGalleryMail = (
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
                "https://cloud.appwrite.io/v1/storage/buckets/66aa1aa0001a0c51d892/files/66d988de000cf7f960c3/view?project=66aa198b0038ad614178&project=66aa198b0038ad614178&mode=admin"
              }
              width="100"
              height="20"
              alt="Omenai logo"
              className="mx-auto mt-10"
            />

            <Text className="text-black text-[14px] leading-[24px]">
              <strong>Dear {name},</strong>
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              We are excited to inform you that your artwork, titled{" "}
              <strong>{artwork}</strong> with{" "}
              <strong>(Order ID #{order_id})</strong> has been successfully
              purchased on <strong>OMENAI Inc</strong>. The payment has been
              processed, and the funds have been deposited into your Stripe
              Connect account.{" "}
            </Text>
            <div className="w-fit p-5 bg-black text-white border border-t-8 border-t-white flex">
              <div className="">
                <div className="w-full">
                  <Text className="uppercase text-center font-semibold">
                    TRANSACTION DETAILS
                  </Text>

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

            <Text className="text-black text-[14px] leading-[24px]">
              You can view the details of this payment and manage your funds
              through your{" "}
              <Link href={`${url}/gallery/payouts`}>Stripe dashboard</Link>.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Please ensure the artwork is prepared for delivery based on the
              agreed terms with the buyer. <br />
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
              <Link href={"mailto:contact@omenai.net"}>contact@omenai.net</Link>
              .
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              Thank you for being a valued member of{" "}
              <strong>Omenai Inc.</strong>, and we look forward to seeing more
              of your incredible work!
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

export default PaymentSuccessfulGalleryMail;
