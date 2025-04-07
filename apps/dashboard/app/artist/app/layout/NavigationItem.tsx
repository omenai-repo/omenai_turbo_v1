"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import IconWrapper from "./IconWrapper";
import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";

type ItemProps = {
  title: string;
  icon: React.ReactNode;
  url: string;
  mobile: boolean;
  onClick?: () => void;
};
export default function NavigationItem({
  title,
  icon,
  url,
  mobile,
  onClick,
}: ItemProps) {
  const pathname = usePathname();
  const { artist_sidebar } = artistActionStore();

  return (
    <>
      <Link
        onClick={onClick}
        href={url}
        className={`p-2  ${artist_sidebar ? "w-fit" : "w-full"} ${
          pathname.startsWith(url)
            ? "bg-white text-dark"
            : "bg-transparent text-white"
        } group flex items-center px-2 hover:bg-dark rounded-full`}
      >
        <IconWrapper
          className={` ${pathname.startsWith(url) ? "bg-white text-white" : "group"}`}
        >
          {icon}
        </IconWrapper>
        {!artist_sidebar && (
          <p className={`text-xs p-2 font-normal group-hover:text-white`}>
            {title}
          </p>
        )}
      </Link>
    </>
  );
}
