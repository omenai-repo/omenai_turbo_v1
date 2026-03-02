import { sendMailVerification } from "../../controller/emailController";
import RequestPriceEmail from "../../views/order/RequestPriceEmail";
import { ArtworkSchemaTypes } from "@omenai/shared-types/index";

type EmailData = {
  name: string;
  email: string;
  artwork_data: Pick<
    ArtworkSchemaTypes,
    "title" | "artist" | "art_id" | "pricing" | "url" | "medium"
  >;
};
export const sendPriceEmail = async ({
  name,
  email,
  artwork_data,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Advisory",
    from: "transactions",
    to: email,
    subject: `Private Price Inquiry Response`,
    react: RequestPriceEmail({ name, artwork_data }),
  });
};
