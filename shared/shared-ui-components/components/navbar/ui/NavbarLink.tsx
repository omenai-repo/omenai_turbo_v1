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
    <li className="relative list-none group">
      {disabled ? (
        <div className="flex items-center gap-1 opacity-30 cursor-not-allowed">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-dark">
            {text}
          </span>
          <CiLock className="w-3 h-3" />
        </div>
      ) : (
        <Link
          href={link}
          onClick={() => updateOpenSideNav(false)}
          className="relative flex flex-col items-center"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 group-hover:text-dark transition-colors duration-500">
            {text}
          </span>
          <div className="absolute -bottom-1 w-0 h-[1px] bg-dark transition-all duration-500 ease-in-out group-hover:w-full" />
        </Link>
      )}
    </li>
  );
}
