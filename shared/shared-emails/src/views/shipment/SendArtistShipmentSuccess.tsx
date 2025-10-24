import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Link,
} from "@react-email/components";

export default function SendArtistShipmentSuccess(
  name: string,
  dashboardUrl: string
) {
  return (
    <Html>
      <Head />
      <Preview>
        Great news! Your artwork has been delivered and funds are available for
        withdrawal.
      </Preview>
      <Body
        style={{
          backgroundColor: "#ffffff",
          color: "#0f172a",
          fontFamily: "Helvetica, Arial, sans-serif",
          padding: "40px 20px",
        }}
      >
        <Container style={{ maxWidth: "600px", margin: "0 auto" }}>
          <Section
            style={{
              border: "1px solid #eee",
              borderRadius: "12px",
              padding: "32px",
            }}
          >
            <Heading
              as="h2"
              style={{
                color: "#0f172a",
                fontSize: "24px",
                marginBottom: "20px",
              }}
            >
              Artwork Delivered Successfully!
            </Heading>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: "1.5",
                marginBottom: "16px",
              }}
            >
              Hi {name},
            </Text>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: "1.5",
                marginBottom: "16px",
              }}
            >
              Congratulations! Your artwork has been successfully delivered to
              the buyer.
            </Text>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: "1.5",
                marginBottom: "24px",
              }}
            >
              Your earnings from this sale are now available in your account and
              ready to be withdrawn at any time.
            </Text>

            <div style={{ textAlign: "center", margin: "30px 0" }}>
              <Link
                href={`${dashboardUrl}`}
                style={{
                  display: "inline-block",
                  backgroundColor: "#10b981",
                  color: "#ffffff",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "16px",
                }}
              >
                Withdraw Funds
              </Link>
            </div>

            <Text
              style={{
                fontSize: "14px",
                lineHeight: "1.5",
                color: "#64748b",
                marginTop: "24px",
              }}
            >
              Thank you for being part of the Omenai community. We're thrilled
              to see your art finding new homes!
            </Text>

            <Text
              style={{
                fontSize: "16px",
                lineHeight: "1.5",
                marginTop: "32px",
              }}
            >
              If you have any questions about your withdrawal or need
              assistance, our support team is here to help.
            </Text>

            <Text style={{ marginTop: "40px", fontSize: "16px" }}>
              Best regards,
              <br />
              The Omenai Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
