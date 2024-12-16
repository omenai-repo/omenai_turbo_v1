import Link from "next/link";
import TokenBlock from "./components/TokenBlock";
import { GalleryLogo } from "@omenai/shared-ui-components/components/logo/Logo";

export const dynamicParams = false;
export default async function VerifyEmail({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const slug = (await params).token;
  // Check if gallery is verified and then redirect
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
        <hr className="bg-[#e0e0e0] my-8" />
        {/* Body */}
        <TokenBlock token={slug} />
      </div>
    </div>
  );
}
