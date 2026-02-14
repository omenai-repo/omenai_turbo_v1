import { sendMailVerification } from "../../controller/emailController";
import InvoiceMail from "../../views/invoice/InvoiceMail";
type EmailData = {
  name: string;
  email: string;
  pdfBuffer: Buffer;
};

export const sendPurchaseInvoice = async ({
  name,
  email,
  pdfBuffer,
}: EmailData) => {
  const { data, error } = await sendMailVerification({
    from: "orders",
    to: email,
    subject: "Your Omenai Payment Receipt for artwork purchase",
    prefix: "Orders",
    react: InvoiceMail({ name }),
    attachments: [
      {
        filename: "invoice.pdf",
        content: pdfBuffer.toString("base64"),
        contentType: "application/pdf",
      },
    ],
  });

  if (error)
    return {
      error: true,
      message: "Error sending email",
    };
  else {
    return {
      error: false,
      message: "Email sent successfully",
    };
  }
};
