"use client";
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
  const pathname = usePathname();
  return (
    <>
      {title === "Sign out" ? (
        <li
          onClick={onClick}
          className={`p-2 group flex items-center w-full hover:bg-dark hover:text-white rounded-xl cursor-pointer`}
        >
          <IconWrapper className="hover:bg-white hover:text-dark group">
            {icon}
          </IconWrapper>
          <p className={`text-fluid-xs p-2 font-normal`}>{title}</p>
        </li>
      ) : (
        <Link
          onClick={onClick}
          href={url}
          className={`p-2 ${
            pathname.startsWith(url)
              ? "bg-dark text-white"
              : "bg-white text-dark"
          } group flex items-center w-full hover:bg-dark rounded-xl`}
        >
          <IconWrapper
            className={` ${pathname.startsWith(url) ? "bg-white text-white" : "group"}`}
          >
            {icon}
          </IconWrapper>
          <p className={`text-fluid-xs p-2 font-normal group-hover:text-white`}>
            {title}
          </p>
        </Link>
      )}
    </>
  );
}
