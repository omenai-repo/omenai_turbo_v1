"use client";
import { UserDashboardNavigationStore } from "@omenai/shared-state-store/src/user/navigation/NavigationStore";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = ["Saves", "Orders", "Profile", "Settings"];

const NavigationChipTabs = () => {
  //   const [selected, setSelected] = useState(tabs[0]);
  const { selected, setSelected } = UserDashboardNavigationStore();

  return (
    <div className=" pb-[0.90rem] pt-6 grid grid-cols-4 items-center w-full border-b  border-b-dark/10">
      {tabs.map((tab, index) => (
        <Chip
          text={tab}
          selectedTab={selected === tab.toLowerCase()}
          setSelectedTab={setSelected}
          key={tab}
        />
      ))}
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
      className={`hover:text-dark hover:underline text-[14px] font-normal transition-colors py-0.5 relative text-center`}
    >
      <span className="relative z-10 font-medium">{text}</span>
      {selectedTab && (
        <motion.span
          layoutId="pill-tab"
          transition={{ type: "spring", duration: 0.5 }}
          className="absolute inset-0 z-0 border-b border-b-dark bottom-[-15px]"
        ></motion.span>
      )}
    </Link>
  );
};

export default NavigationChipTabs;
