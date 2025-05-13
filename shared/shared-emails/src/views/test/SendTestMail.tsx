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

const SendTestMail = (name: string) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Img
              src={
                "https://fra.cloud.appwrite.io/v1/storage/buckets/6822733300074eb56561/files/68231da4000e5b382a50/view?project=682272b1001e9d1609a8&mode=admin"
              }
              width="120"
              height="20"
              alt="Omenai logo"
              className="mx-auto mt-10"
            />

            <Heading className="text-black text-fluid-md font-normal text-center p-0 mb-[40px] mx-0">
              Test Email
            </Heading>
            <Text>Hello {name}</Text>
            <Text>This is a test email</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default SendTestMail;
