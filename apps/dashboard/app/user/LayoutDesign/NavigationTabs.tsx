"use client";

import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { UserDashboardNavigationStore } from "@omenai/shared-state-store/src/user/navigation/NavigationStore";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import { UserMenu } from "@omenai/shared-ui-components/components/navbar/ui/UserMenu";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const tabs = ["Saves", "Orders", "Profile", "Settings"];

const NavigationChipTabs = () => {
  const { selected, setSelected } = UserDashboardNavigationStore();
  const pathname = usePathname();
  const [isSticky, setIsSticky] = useState(false);

  const activeTab = pathname?.split("/").pop() || selected;

  const handleLogout = () => {
    console.log("Logout clicked");
  };

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
      {/* Top row: Logo, Homepage, Logout */}
      <div className="flex justify-between items-center py-3">
        <IndividualLogo />
        <UserMenu />
      </div>

      {/* Tab row */}
      <div className=" grid grid-cols-4 items-center w-full px-4 bg-white">
        {tabs.map((tab) => (
          <Chip
            key={tab}
            text={tab}
            selectedTab={activeTab === tab.toLowerCase()}
            setSelectedTab={setSelected}
          />
        ))}
      </div>
    </div>
  );
};

const Chip = ({
  text,
  selectedTab,
  setSelectedTab,
}: {
  text: string;
  selectedTab: boolean;
  setSelectedTab: (label: string) => void;
}) => {
  return (
    <Link
      href={`/user/${text.toLowerCase()}`}
      onClick={() => setSelectedTab(text.toLowerCase())}
      className="relative py-2 text-center group transition-all duration-300 flex flex-col items-center"
    >
      <span
        className={`font-normal text-fluid-xs ${selectedTab ? "text-dark" : "text-slate-800"} transition-colors duration-300`}
      >
        {text}
      </span>

      {/* Active tab underline */}
      {selectedTab && (
        <motion.span
          layoutId="pill-tab"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="mt-1 w-10 h-1 rounded bg-dark"
        />
      )}

      {/* Hover effect underline */}
      {!selectedTab && (
        <span className="mt-1 w-0 h-1 rounded bg-slate-600 group-hover:w-10 transition-all duration-300"></span>
      )}
    </Link>
  );
};

export default NavigationChipTabs;
