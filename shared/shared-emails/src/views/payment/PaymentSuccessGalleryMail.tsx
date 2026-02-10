import { dashboard_url, getApiUrl } from "@omenai/url-config/src/config";
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
  transaction_Id: string,
) => {
  const url = dashboard_url();
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Img
              src={
                "https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/696ee3b60025e2a2c4ff/view?project=682272b1001e9d1609a8"
              }
              width="100"
              height="20"
              alt="Omenai logo"
              className="mx-auto mt-10"
            />

            <Text className="text-dark text-fluid-xxs leading-[24px]">
              <strong>Dear {name},</strong>
            </Text>
            <Text className="text-dark text-fluid-xxs leading-[24px]">
              We are excited to inform you that your artwork, titled{" "}
              <strong>{artwork}</strong> with{" "}
              <strong>(Order ID #{order_id})</strong> has been successfully
              purchased on <strong>OMENAI Inc</strong>. The payment has been
              processed, and the funds have been deposited into your Stripe
              Connect account.{" "}
            </Text>

            <div className="bg-blue-50 border border-blue-200 rounded p-6 mb-8">
              <Text className="text-blue-900 font-semibold text-base mb-3">
                Next Steps
              </Text>
              <Text className="text-blue-800 text-sm leading-relaxed mb-4">
                • Prepare your artwork for shipment pickup
                <br />• Monitor your payment status in your Stripe dashboard
              </Text>

              <div className="text-center mt-4">
                <Link
                  href={`${url}/gallery/payouts`}
                  className="inline-block bg-[#1a1a1a] hover:bg-[#1a1a1a/80] text-white font-medium px-6 py-2 rounded text-sm transition-colors"
                >
                  View Payment Details
                </Link>
              </div>
            </div>

            <Text className="text-dark text-fluid-xxs leading-[24px]">
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

            <Text className="text-dark text-fluid-xxs leading-[24px]">
              Thank you for being a valued member of <strong>Omenai</strong>,
              and we look forward to seeing more of your incredible work!
            </Text>
            <Text className="text-dark text-fluid-xxs leading-[24px]">
              Best regards, <br />
              Moses from Omenai
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-dark text-[12px] leading-[24px]">
              Please be advised that the information contained within this email
              was directed exclusively to{" "}
              <span className="text-dark">{name} </span>. In the event that you
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
