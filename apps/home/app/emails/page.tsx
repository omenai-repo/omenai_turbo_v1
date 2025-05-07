import { render } from "@react-email/render";
import { PaymentFailedEmail } from "./Test";

export default async function EmailPreviewPage() {
  const emailHtml = await render(<>Helllo world</>, {
    pretty: true,
  });

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: emailHtml,
      }}
    />
  );
}
