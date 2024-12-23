import { getApiUrl } from "@omenai/url-config/src/config";
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

const OrderRequestReminder = (name: string) => {
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
              width="120"
              height="20"
              alt="Omenai logo"
              className="mx-auto mt-10"
            />

            <Heading className="text-black text-[24px] font-normal text-center p-0 mb-[20px] mx-0">
              You have an order request
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello <strong>{name}</strong>,
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              I hope this email finds you well. <br />
              This is a friendly reminder that there are pending order requests
              awaiting your attention on your dashboard. To ensure a positive
              experience for your customers, we encourage you to review and
              respond to these requests at your earliest convenience.
            </Text>

            <div className="w-full grid place-items-center text-center">
              <Link
                className="w-fit bg-black text-white text-center px-5 cursor-pointer py-3"
                href={`${url}/gallery/orders`}
              >
                View orders on your dashboard
              </Link>
            </div>

            <Text className="text-black text-[14px] leading-[24px]">
              Upon logging into your dashboard, you will be able to:
            </Text>
            <div className="my-0">
              <ul>
                <li>
                  <Text className="text-black text-[14px] leading-[24px]">
                    Review the order details.
                  </Text>
                </li>
                <li>
                  <Text className="text-black text-[14px] leading-[24px]">
                    Accept or decline the order request.
                  </Text>
                </li>
                <li>
                  <Text className="text-black text-[14px] leading-[24px]">
                    Provide a quote for the artwork, including shipping fees and
                    any applicable taxes.
                  </Text>
                </li>
              </ul>
            </div>
            <Text className="text-black text-[14px] leading-[24px]">
              Please note that timely responses to order requests are crucial in
              ensuring a positive user experience and facilitating successful
              transactions.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Should you encounter any difficulties or have any questions
              regarding this order request, please do not hesitate to reach out
              to our support team for assistance at{" "}
              <Link
                href="mailto:contact@omenani.net"
                className="underline text-blue-800 italic"
              >
                contact@omeani.net
              </Link>
              .
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Thank you for your continued partnership with our platform. We
              appreciate your dedication to showcasing your artworks and serving
              our community of art enthusiasts.
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

export default OrderRequestReminder;
