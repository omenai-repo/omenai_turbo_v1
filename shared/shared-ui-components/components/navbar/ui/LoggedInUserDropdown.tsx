"use client";
import { FiChevronDown } from "react-icons/fi";
import { motion } from "framer-motion";
import { Dispatch, SetStateAction, useState } from "react";
import { IconType } from "react-icons";
import { GrFavorite } from "react-icons/gr";
import { CgLogOut, CgProfile } from "react-icons/cg";
import { RiAuctionLine } from "react-icons/ri";
import { CiSettings } from "react-icons/ci";
import Link from "next/link";
import { UserDashboardNavigationStore } from "@omenai/shared-state-store/src/user/navigation/NavigationStore";
import { toast } from "sonner";
import { BiUser } from "react-icons/bi";
import { signOut } from "@omenai/shared-services/auth/session/deleteSession";
import { useRouter } from "next/navigation";
import { dashboard_url, auth_uri } from "@omenai/url-config/src/config";

const LoggedInUserDropDown = ({ user }: { user: string | undefined }) => {
  const [open, setOpen] = useState(false);
  const { setSelected } = UserDashboardNavigationStore();
  return (
    <div className=" flex items-center justify-center bg-white">
      <motion.div animate={open ? "open" : "closed"} className="relative">
        <button
          onClick={() => setOpen((pv) => !pv)}
          className="flex items-center gap-1 pl-3 py-2 rounded-sm text-gray-700 transition-colors"
        >
          <span className="md:block font-medium whitespace-nowrap text-base hidden">
            {user}
          </span>
          <BiUser className="text-sm" />

          <motion.span variants={iconVariants}>
            <FiChevronDown />
          </motion.span>
        </button>

        <motion.ul
          initial={wrapperVariants.closed}
          variants={wrapperVariants}
          style={{ originY: "top", translateX: "-100%" }}
          className="flex flex-col gap-2 p-5 text-gray-700 bg-white shadow-xl absolute top-[120%] left-[140%] md:left-[100%] w-48 overflow-hidden z-40 ring-1 ring-dark/20 rounded-[20px]"
        >
          <Option
            setSelectedTab={setSelected}
            setOpen={setOpen}
            Icon={GrFavorite}
            text="Saves"
          />
          <Option
            setSelectedTab={setSelected}
            setOpen={setOpen}
            Icon={RiAuctionLine}
            text="Orders"
          />
          <Option
            setSelectedTab={setSelected}
            setOpen={setOpen}
            Icon={CgProfile}
            text="Profile"
          />
          <Option
            setSelectedTab={setSelected}
            setOpen={setOpen}
            Icon={CiSettings}
            text="Settings"
          />
          <Option
            setSelectedTab={setSelected}
            setOpen={setOpen}
            Icon={CgLogOut}
            text="Logout"
          />
        </motion.ul>
      </motion.div>
    </div>
  );
};

const Option = ({
  text,
  Icon,
  setOpen,
  setSelectedTab,
}: {
  text: string;
  Icon: IconType;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedTab: (label: string) => void;
}) => {
  const router = useRouter();
  const auth_url = auth_uri();
  const base_dashboard_url = dashboard_url();

  async function handleSignout() {
    toast.info("Signing you out...");
    const res = await signOut();

    if (res.isOk) {
      toast.info("Operation successful", {
        description: "Successfully signed out...redirecting",
      });
      router.replace(`${auth_url}/login`);
    } else {
      toast.error("Operation successful", {
        description:
          "Something went wrong, please try again or contact support",
      });
    }
  }
  return (
    <>
      {text === "Logout" ? (
        <>
          <motion.li
            variants={itemVariants}
            onClick={handleSignout}
            className="flex items-center gap-2 w-full p-3 text-base font-medium whitespace-nowrap hover:bg-dark text-slate-700 hover:text-white transition-colors cursor-pointer rounded-[10px]"
          >
            <motion.span variants={actionIconVariants}>
              <Icon />
            </motion.span>
            <span>{text}</span>
          </motion.li>
        </>
      ) : (
        <Link href={`${base_dashboard_url}/user/${text.toLowerCase()}`}>
          <motion.li
            variants={itemVariants}
            onClick={() => {
              setSelectedTab(text.toLowerCase());
              setOpen(false);
            }}
            className="flex items-center gap-2 w-full p-3 text-base font-medium whitespace-nowrap hover:bg-dark text-slate-700 hover:text-white transition-colors cursor-pointer rounded-[10px]"
          >
            <motion.span variants={actionIconVariants}>
              <Icon />
            </motion.span>
            <span>{text}</span>
          </motion.li>
        </Link>
      )}
    </>
  );
};

export default LoggedInUserDropDown;

const wrapperVariants = {
  open: {
    scaleY: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
  closed: {
    scaleY: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.05,
    },
  },
};

const iconVariants = {
  open: { rotate: 180 },
  closed: { rotate: 0 },
};

const itemVariants = {
  open: {
    opacity: 1,
    y: 0,
    transition: {
      when: "beforeChildren",
    },
  },
  closed: {
    opacity: 0,
    y: -15,
    transition: {
      when: "afterChildren",
    },
  },
};

const actionIconVariants = {
  open: { scale: 1, y: 0 },
  closed: { scale: 0, y: -7 },
};
