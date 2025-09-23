"use client";
import Link from "next/link";
import Image from "next/image";
import { base_url } from "@omenai/url-config/src/config";
import { useWindowSize } from "usehooks-ts";

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
            "https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/68d2ab83002025087b36/view?project=682272b1001e9d1609a8"
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
            "https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/68d2ab83002025087b36/view?project=682272b1001e9d1609a8"
          }
          alt="omenai logo"
          width={130}
          height={50}
          priority={true}
        />
        <span
          className={`font-normal text-fluid-xs relative xxs:top-1 ${
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
            "https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/68d2ab83002025087b36/view?project=682272b1001e9d1609a8"
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
export const ArtistLogo = ({ className }: LogoProps) => {
  const base_uri = base_url();

  return (
    <>
      <Link href={base_uri} className={`flex gap-1 items-end ${className}`}>
        <Image
          src={
            "https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/68d2ab83002025087b36/view?project=682272b1001e9d1609a8"
          }
          alt="omenai logo"
          width={100}
          height={50}
          priority={true}
        />

        <span className={`font-normal text-fluid-xs relative xxs:top-1`}>
          For Artist
        </span>
      </Link>
    </>
  );
};
