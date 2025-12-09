"use client";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import { UserMenu } from "@omenai/shared-ui-components/components/navbar/ui/UserMenu";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 0);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <div
      className={`w-full bg-white z-50 ${isSticky ? "fixed top-0 left-0 border-b border-b-slate-200 px-4 lg:px-16" : ""} transition-all duration-300`}
    >
      <div className="flex justify-between items-center py-3">
        <IndividualLogo />
        <UserMenu />
      </div>
    </div>
  );
};

export default Navbar;
