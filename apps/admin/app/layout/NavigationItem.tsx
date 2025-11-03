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
  disabled: boolean;
};
export default function NavigationItem({
  title,
  icon,
  url,
  mobile,
  onClick,
  disabled,
}: ItemProps) {
  const pathname = usePathname();
  return (
    <>
      {title === "Sign out" ? (
        <li
          className={`p-2 group flex items-center w-full hover:bg-dark hover:text-white rounded cursor-pointer`}
        >
          <button type="button" onClick={onClick}>
            <IconWrapper className="hover:bg-white hover:text-dark group">
              {icon}
            </IconWrapper>
            <p className={`text-fluid-xxs font-normal`}>{title}</p>
          </button>
        </li>
      ) : disabled ? (
        <Link
          onClick={onClick}
          href={url}
          className={`px-3 py-1 ${
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
          <p
            className={`text-fluid-xxs p-2 font-normal group-hover:text-white`}
          >
            {title}
          </p>
        </Link>
      ) : (
        <>
          <div className="opacity-50 flex items-center bg-white p-2 text-dark cursor-not-allowed">
            <IconWrapper className="hover:bg-white hover:text-dark group">
              {icon}
            </IconWrapper>
            {title}
          </div>
        </>
      )}
    </>
  );
}
