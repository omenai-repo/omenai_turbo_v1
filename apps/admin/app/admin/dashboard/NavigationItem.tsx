"use client";
import { adminNavigationActions } from "@omenai/shared-state-store/src/admin/AdminNavigationStore";
import IconWrapper from "./IconWrapper";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  const { open } = adminNavigationActions();

  const pathname = usePathname();
  return (
    <>
      {title === "Sign out" ? (
        <li
          onClick={onClick}
          className={`p-2 ${
            (open || mobile) && "gap-x-4 "
          } group flex items-center w-fit rounded-md`}
        >
          <IconWrapper
            className={`group-hover:bg-primary bg-white duration-300 `}
          >
            {icon}
          </IconWrapper>
          <p
            className={`text-[14px] p-2 text-white font-light ${
              !open && !mobile && "scale-0 hidden"
            } duration-200`}
          >
            {title}
          </p>
        </li>
      ) : (
        <Link
          onClick={onClick}
          href={url}
          className={`p-2 ${
            (open || mobile) && "gap-x-4"
          } group flex items-center w-fit rounded-md`}
        >
          <IconWrapper
            className={`group-hover:bg-primary duration-300 ${
              pathname.startsWith(url) ? "bg-primary" : "bg-white"
            }`}
          >
            {icon}
          </IconWrapper>
          <p
            className={`text-[14px] p-2 text-white  font-light ${
              !open && !mobile && "scale-0 hidden"
            } duration-200`}
          >
            {title}
          </p>
        </Link>
      )}
    </>
  );
}
