import { sendMailVerification } from "../../controller/emailController";
import WaitlistRegistrationMail from "../../views/waitlist/WaitlistRegistrationMail";

type EmailData = {
  email: string;
};
export const SendWaitlistRegistrationEmail = async ({ email }: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai onboarding",
    from: "onboarding",
    to: email,
    subject: "You're on the list! ",
    react: WaitlistRegistrationMail(email),
  });
};
