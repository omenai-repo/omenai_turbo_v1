import Link from "next/link";
import Image from "next/image";
import { base_url } from "@omenai/url-config/src/config";

type LogoProps = {
  className?: string;
  theme?: "light" | "dark";
};
export const GalleryLogo = ({ className, theme = "dark" }: LogoProps) => {
  const base_uri = base_url();
  return (
    <>
      <Link
        href={base_uri}
        className="flex flex-col xxs:flex-row xxs:gap-1 items-end relative"
      >
        <Image
          src={
            "https://cloud.appwrite.io/v1/storage/buckets/66aa1aa0001a0c51d892/files/6785355400283703b3d9/view?project=66aa198b0038ad614178&project=66aa198b0038ad614178&mode=admin"
          }
          alt="omenai logo"
          width={130}
          height={50}
          priority={true}
        />
        <span
          className={`font-normal text-[14px] relative xxs:top-1 ${
            theme === "light" ? "text-white" : "text-black"
          } ${className}`}
        >
          For Galleries
        </span>
      </Link>
    </>
  );
};
export const AdminLogo = ({ className, theme = "dark" }: LogoProps) => {
  const base_uri = base_url();

  return (
    <>
      <Link
        href={base_uri}
        className="flex flex-col xxs:flex-row xxs:gap-1 items-end relative"
      >
        <Image
          src={
            "https://cloud.appwrite.io/v1/storage/buckets/66aa1aa0001a0c51d892/files/6785355400283703b3d9/view?project=66aa198b0038ad614178&project=66aa198b0038ad614178&mode=admin"
          }
          alt="omenai logo"
          width={130}
          height={50}
          priority={true}
        />
        <span
          className={`font-normal text-[14px] relative xxs:top-1 ${
            theme === "light" ? "text-white" : "text-black"
          } ${className}`}
        >
          Admin
        </span>
      </Link>
    </>
  );
};

export const IndividualLogo = ({ className }: LogoProps) => {
  const base_uri = base_url();

  return (
    <>
      <Link href={base_uri} className={`flex gap-1 items-end ${className}`}>
        <Image
          src={
            "https://cloud.appwrite.io/v1/storage/buckets/66aa1aa0001a0c51d892/files/6785355400283703b3d9/view?project=66aa198b0038ad614178&project=66aa198b0038ad614178&mode=admin"
          }
          alt="omenai logo"
          width={130}
          height={50}
          priority={true}
        />
      </Link>
    </>
  );
};
