"use client";

import Link from "next/link";
import Tab from "./Tab";
import { MdArrowRightAlt } from "react-icons/md";
import { useContext } from "react";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { IndividualSchemaTypes } from "@omenai/shared-types";

type TabsTypes = {
  catalogue: boolean;
};
export default function Tabs({ catalogue = false }: TabsTypes) {
  const { session } = useContext(SessionContext);
  return (
    <div className="flex justify-between items-center px-2">
      <div className="flex gap-x-2 items-center">
        <Tab mobile={false} title="Recently uploaded" tag="recent" />
        <Tab mobile={false} title="Trending uploads" tag="trending" />
        {/* <Tab mobile={false} title="Art collections" tag="collections" /> */}
        {(session as IndividualSchemaTypes)?.role === "user" && (
          <Tab mobile={false} title="Tailored for you" tag="tailored" />
        )}
      </div>
      <div className={`${catalogue ? "hidden" : "block"}`}>
        <Link
          href={"/catalog"}
          className="flex items-center gap-x-2 text-fluid-xs"
        >
          <span>See more</span>
          <MdArrowRightAlt />
        </Link>
      </div>
    </div>
  );
}
