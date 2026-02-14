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
        <div className="flex items-center gap-1 opacity-40 cursor-not-allowed">
          <span className="text-sm font-sans font-medium text-neutral-400">
            {text}
          </span>
          <CiLock className="w-3 h-3 text-neutral-400" />
        </div>
      ) : (
        <Link
          href={link}
          onClick={() => updateOpenSideNav(false)}
          className="group flex items-center gap-1"
        >
          <span className="text-sm font-sans font-medium text-neutral-600 group-hover:text-dark  transition-colors duration-200">
            {text}
          </span>
        </Link>
      )}
    </li>
  );
}
