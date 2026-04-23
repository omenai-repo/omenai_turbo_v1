"use client";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import Link from "next/link";
import { CiLock } from "react-icons/ci";

export default function NavbarLink({
  disabled,
  text,
  link,
}: {
  disabled: boolean;
  text: string;
  link: string;
}) {
  const { updateOpenSideNav } = actionStore();

  return (
    <li className="relative list-none">
      {disabled ? (
        <div className="flex items-center gap-1.5 opacity-30 cursor-not-allowed select-none">
          <span className="text-[13px] tracking-wide font-normal text-neutral-500">
            {text}
          </span>
          <CiLock className="w-3 h-3 text-neutral-400" />
        </div>
      ) : (
        <Link
          href={link}
          onClick={() => updateOpenSideNav(false)}
          className="group relative flex items-center"
        >
          <span
            className="
              text-[13px] tracking-wide
              font-normal text-neutral-400
              group-hover:font-medium group-hover:text-neutral-900
              transition-all duration-200 ease-out
            "
          >
            {text}
          </span>
        </Link>
      )}
    </li>
  );
}
