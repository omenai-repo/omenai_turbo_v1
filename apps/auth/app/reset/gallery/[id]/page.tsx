import Link from "next/link";

import PasswordBlock from "./components/PasswordBlock";
import { GalleryLogo } from "@omenai/shared-ui-components/components/logo/Logo";

export default async function ResetPassword({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const slug = (await params).id;
  // Check if user is verified and then redirect
  return (
    <div className="w-full h-full font-dark p-5">
      <div className="container lg:w-50% my-4">
        {/* Header */}
        <div className="flex xxs:flex-row flex-col gap-y-4 justify-between items-center">
          <GalleryLogo />

          <Link href={"/auth/login/"} className="underline">
            Back to login
          </Link>
        </div>
        <hr className="bg-gray-400/20 my-8" />
        {/* Body */}
        <PasswordBlock token={slug} />
      </div>
    </div>
  );
}
