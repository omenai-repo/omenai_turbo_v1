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
            "https://cloud.appwrite.io/v1/storage/buckets/66e1aa4f000b16df96a2/files/67489398000b8e614835/view?project=655231c3469bf1ef8d8f&project=655231c3469bf1ef8d8f"
          }
          alt="omenai logo"
          width={130}
          height={50}
          priority={true}
        />
        <span
          className={`font-normal text-xs relative xxs:top-1 ${
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
            "https://cloud.appwrite.io/v1/storage/buckets/66e1aa4f000b16df96a2/files/67489398000b8e614835/view?project=655231c3469bf1ef8d8f&project=655231c3469bf1ef8d8f"
          }
          alt="omenai logo"
          width={130}
          height={50}
          priority={true}
        />
        <span
          className={`font-normal text-xs relative xxs:top-1 ${
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
            "https://cloud.appwrite.io/v1/storage/buckets/66e1aa4f000b16df96a2/files/67489398000b8e614835/view?project=655231c3469bf1ef8d8f&project=655231c3469bf1ef8d8f"
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
