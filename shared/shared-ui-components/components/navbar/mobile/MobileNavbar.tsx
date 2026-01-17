"use client";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { TfiClose } from "react-icons/tfi";
import { IndividualLogo } from "../../logo/Logo";
import Link from "next/link";

const navItems = [
  { label: "Catalogue", href: "/catalog", index: "01" },
  { label: "Pricing", href: "/gallery/pricing", index: "02" },
  { label: "Shop", href: "https://omenai.shop", index: "03" },
  { label: "Editorials", href: "/articles", index: "04" },
];

export default function MobileNavbar() {
  const { openSideNav, updateOpenSideNav } = actionStore();

  return (
    <div
      className={`fixed inset-0 z-[100] bg-white transition-transform duration-700 ease-in-out ${
        openSideNav ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex justify-between items-center py-6 px-6">
        <IndividualLogo />
        <button onClick={() => updateOpenSideNav(false)} className="p-2">
          <TfiClose size={20} />
        </button>
      </div>

      <nav className="mt-12 px-8">
        <ul className="space-y-8">
          {navItems.map((item) => (
            <li key={item.index} className="group overflow-hidden">
              <Link
                href={item.href}
                onClick={() => updateOpenSideNav(false)}
                className="flex items-end gap-4"
              >
                <span className="text-[10px] font-mono text-neutral-300 mb-2">
                  {item.index}
                </span>
                <span className="text-5xl font-serif italic text-dark group-hover:pl-4 transition-all duration-500">
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-20 pt-8 border-t border-neutral-100 flex flex-col gap-6">
          <Link
            href="/login"
            className="text-xs uppercase tracking-[0.3em] font-bold"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="text-xs uppercase tracking-[0.3em] font-bold text-neutral-400"
          >
            Create Account
          </Link>
        </div>
      </nav>
    </div>
  );
}
