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
    prefix: "Omenai orders",
    from: "transactions",
    to: email,
    subject: `Requested Information: Base Price of artwork`,
    react: RequestPriceEmail(name, artwork_data),
  });
};
