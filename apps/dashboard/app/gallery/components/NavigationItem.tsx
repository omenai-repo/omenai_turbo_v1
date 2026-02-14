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
  onClick,
}: ItemProps) {
  const pathname = usePathname();
  return (
    <>
      {title === "Sign out" ? (
        <li
          className={`p-2 group flex items-center w-full hover:bg-dark hover:text-white rounded cursor-pointer`}
        >
          <button
            onClick={onClick}
            type="button"
            role="container"
            className="flex items-center"
          >
            <IconWrapper className=" hover:text-dark group">{icon}</IconWrapper>
            <p className={`text-fluid-xxs p-2 font-light`}>{title}</p>
          </button>
        </li>
      ) : (
        <Link
          href={url}
          onClick={(e) => {
            if (pathname.startsWith(url)) {
              e.preventDefault();
              e.stopPropagation();
            }
            onClick && onClick();
          }}
          className={`p-2 ${pathname.startsWith(url) ? "pointer-events-none text-gray-400" : ""}} ${
            pathname.startsWith(url)
              ? "bg-dark text-white"
              : "bg-white text-dark"
          } group flex items-center w-full hover:bg-dark rounded`}
        >
          <IconWrapper
            className={` ${pathname.startsWith(url) ? "bg-white text-white" : "group"}`}
          >
            {icon}
          </IconWrapper>
          <p className={`text-fluid-xxs p-2 font-light group-hover:text-white`}>
            {title}
          </p>
        </Link>
      )}
    </>
  );
}
