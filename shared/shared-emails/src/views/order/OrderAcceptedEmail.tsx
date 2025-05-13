import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { base_url, getApiUrl } from "@omenai/url-config/src/config";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Tailwind,
  Section,
  Img,
  Text,
  Link,
} from "@react-email/components";

const OrderAcceptedEmail = (
  name: string,
  order_id: string,
  user_id: string,
  artwork_data: Pick<
    ArtworkSchemaTypes,
    "title" | "artist" | "art_id" | "pricing" | "url"
  >
) => {
  const url = base_url();
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className=" rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Img
              src={
                "https://fra.cloud.appwrite.io/v1/storage/buckets/6822733300074eb56561/files/68231da4000e5b382a50/view?project=682272b1001e9d1609a8&mode=admin"
              }
              width="120"
              height="20"
              alt="Omenai logo"
              className="mx-auto my-5"
            />
            <Heading className="text-black text-fluid-md font-normal text-center p-0 mb-[40px] mx-0">
              Your order request has been accepted
            </Heading>
            <Text className="text-black text-fluid-xs leading-[24px]">
              Hello <strong>{name}</strong>,
            </Text>
            <Text className="text-black text-fluid-xs leading-[24px]">
              I hope this email finds you well. <br />
              We are thrilled to inform you that your order request for{" "}
              <Link
                href={`${url}/artwork/${artwork_data.title}`}
                className="underline text-blue-800 italic font-normal"
              >
                {artwork_data.title}
              </Link>{" "}
              has been accepted by the gallery. They have provided all the
              necessary information, including shipping quotes and applicable
              taxes, to facilitate the purchase of this exquisite artwork.
            </Text>
            <Text className="text-black text-fluid-xs leading-[24px]">
              You can now proceed with the payment for your artwork. To complete
              your purchase, please click on the following link to visit the
              artwork payment page:
            </Text>
            <div className="w-full grid place-items-left text-left">
              <Link
                className="w-fit bg-dark text-white text-fluid-xs text-left px-5 rounded-xl border-2 border-white cursor-pointer py-3"
                href={`${url}/payment/${order_id}?id_key=${user_id}`}
              >
                Pay for this artwork
              </Link>
            </div>
            <Text className="text-black text-fluid-xs leading-[24px]">
              If you have any questions or need further assistance regarding the
              payment process or your order, please feel free to reach out to
              us. We are here to help ensure a smooth and enjoyable experience
              for you.{" "}
              <Link
                href="mailto:contact@omenani.net"
                className="underline text-blue-800 italic"
              >
                contact@omeani.net
              </Link>
              .
            </Text>
            <Text className="text-black text-fluid-xs leading-[24px]">
              Thank you for choosing to support artists on our platform. We
              greatly appreciate your patronage and look forward to seeing this
              stunning artwork find its new home with you.
            </Text>
            <Text className="text-black text-fluid-xs leading-[24px]">
              Best regards, <br />
              Moses from Omenai
            </Text>

            <Section className="text-left">
              <table className="w-full">
                <tr className="w-full">
                  <td align="left">
                    <Img
                      src={
                        "https://fra.cloud.appwrite.io/v1/storage/buckets/6822733300074eb56561/files/68231da4000e5b382a50/view?project=682272b1001e9d1609a8&mode=admin"
                      }
                      width="120"
                      height="20"
                      alt="Omenai logo"
                      className=""
                    />
                  </td>
                </tr>

                <tr>
                  <td align="left">
                    <Text className="font-normal text-fluid-xs text-dark leading-[24px]">
                      123 Main Street Anytown, CA 12345
                    </Text>
                    <Text className="mb-0 font-normal text-fluid-xs text-dark leading-[24px]">
                      mail@example.com +123456789
                    </Text>
                  </td>
                </tr>
              </table>
            </Section>
            <Hr className="my-8 border border-gray-200 " />
            <Text className="text-[12px] leading-5 text-gray-600">
              This message is intended only for <strong>{name}</strong>. If you
              received it by mistake, please delete it and notify us
              immediately. It may contain confidential and legally privileged
              information.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default OrderAcceptedEmail;
