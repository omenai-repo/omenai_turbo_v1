import Link from "next/link";

import PasswordBlock from "./components/PasswordBlock";
import { GalleryLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import { auth_uri } from "@omenai/url-config/src/config";

export default async function ResetPassword({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const slug = (await params).id;
  const auth_url = auth_uri();
  // Check if user is verified and then redirect
  return (
    <div className="w-full h-full font-dark p-5">
      <div className="container lg:w-50% my-4">
        {/* Header */}
        <div className="flex xxs:flex-row flex-col gap-y-4 justify-between items-center">
          <GalleryLogo />

          <Link href={auth_url} className="underline text-xs">
            Back to login
          </Link>
        </div>
        {/* Body */}
        <PasswordBlock token={slug} />
      </div>
    </div>
  );
}
