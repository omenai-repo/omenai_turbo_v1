import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

const RejectGalleryMail = (gallery_name?: string) => {
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
              width="120"
              height="20"
              alt="Omenai logo"
              className="mx-auto my-10"
            />

            <Text className="text-gray-700 text-[14px] leading-[24px]">
              Dear {gallery_name},
            </Text>
            <Text className="text-gray-700 text-[14px] leading-[24px]">
              Thank you for registering your gallery with OMENAI Inc. After
              reviewing your account, we regret to inform you that your
              verification request has not been approved.
            </Text>
            <Text className="text-gray-700 text-[14px] leading-[24px]">
              Due to this, you will no longer be able to register for an account
              on our platform without further assistance. If you believe this
              decision was made in error or if you would like to discuss your
              account further, please contact our support team at{" "}
              <Link
                href="mailto:contact@omenai.net"
                className="text-gray-700 font-bold underline"
              >
                contact@omenai.net
              </Link>
              , and we will be happy to assist you.
            </Text>

            <Text className="text-[14px] leading-[24px]">
              We appreciate your interest in OMENAI Inc, and we are here to
              address any questions or concerns you may have.
            </Text>

            <br />
            <Text className="text-[14px] leading-[24px]">
              Best regards, <br /> The Omenai team
            </Text>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-gray-700 text-[12px] leading-[24px]">
              Please be advised that the information contained within this email
              was directed exclusively to{" "}
              <span className="text-gray-700">{gallery_name} </span>. In the
              event that you were not anticipating the receipt of this email, we
              respectfully request that you refrain from taking any action based
              on its contents. This communication may contain confidential and
              legally privileged information, and it is intended solely for the
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

export default RejectGalleryMail;
