import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

type EmailPayload = {
  prefix: string;
  from: string;
  to: string | string[];
  subject: string;
  react: React.ReactNode;
  bcc?: string[];
  attachments?: {
    filename: string;
    content: string;
  }[];
};

export const sendMailVerification = async (datum: EmailPayload) => {
  console.log(process.env.RESEND_API_KEY!);
  const { data, error } = await resend.emails.send({
    from:
      datum.from === "onboarding"
        ? `${datum.prefix} <onboarding@omenai.app>`
        : datum.from === "orders"
          ? `${datum.prefix} <orders@omenai.app>`
          : `${datum.prefix} <info@omenai.app>`,
    to: datum.to,
    bcc: datum.bcc,
    subject: datum.subject,
    react: datum.react,
    attachments: datum.attachments,
  });

  return { data, error };
};
