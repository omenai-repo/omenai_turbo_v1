import { Resend } from "resend";

const resend = new Resend("re_GjuDbhuA_GtT8oogQWNMaVmF9Y2DdqiXz");

type EmailPayload = {
  prefix: string;
  from: string;
  to: string | string[];
  subject: string;
  react: React.ReactNode;
  bcc?: string[];
};

export const sendMailVerification = async (datum: EmailPayload) => {
  const { data, error } = await resend.emails.send({
    from:
      datum.from === "onboarding"
        ? `${datum.prefix} <onboarding@omenai.app>`
        : `${datum.prefix} <omenai@omenai.app>`,
    to: datum.to,
    bcc: datum.bcc,
    subject: datum.subject,
    react: datum.react,
  });

  return { data, error };
};
