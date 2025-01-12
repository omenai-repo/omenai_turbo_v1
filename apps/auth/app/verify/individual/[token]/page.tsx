import Link from "next/link";
import TokenBlock from "./components/TokenBlock";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import { auth_uri } from "@omenai/url-config/src/config";
// export const dynamicParams = false;

export default async function VerifyEmail({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const slug = (await params).token;
  const auth_url = auth_uri();
  // Check if user is verified and then redirect
  return (
    <div className="w-full h-full font-dark p-5">
      <div className="container lg:w-50% my-4">
        {/* Header */}
        <div className="flex xxs:flex-row flex-col gap-y-4 justify-between items-center">
          <IndividualLogo />

          <Link href={auth_url} className="underline">
            Back to login
          </Link>
        </div>
        <hr className="bg-gray-400/20 my-8" />
        {/* Body */}
        <TokenBlock token={slug} />
      </div>
    </div>
  );
}
