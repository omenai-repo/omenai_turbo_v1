import Link from "next/link";
import { GalleryLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import TokenBlock from "../../components/TokenBlock";

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
      {/* Header */}
      <div className="flex xxs:flex-row flex-col gap-y-4 justify-between items-center">
        <GalleryLogo />

        <Link
          href={"/login/gallery"}
          className="underline text-fluid-xxs font-medium"
        >
          Back to login
        </Link>
      </div>
      <div className="container lg:w-50% h-autp grid place-items-center">
        <hr className="bg-gray-400/20 my-8" />
        {/* Body */}
        <TokenBlock token={slug} route="gallery" />
      </div>
    </div>
  );
}
