import React from "react";
import NavigationHeader from "./NavigationHeader";
import { navMockData } from "./NavigationMockData";
import NavigationItem from "./NavigationItem";
import { CiLogout, CiSettings } from "react-icons/ci";
import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";

export default function NavigationBar() {
  const { artist_sidebar } = artistActionStore();

  return (
    <section
      className={` w-[300px] 2xl:w-[350px] px-10 rounded-[40px] ease-in-out relative h-[calc(100%)] flex py-6  bg-[#111111]`}
    >
      <div>
        <NavigationHeader />
        {/* <hr className="border-gray-700 my-5" /> */}
        {/* Nav items */}

        <ul className="flex flex-col gap-y-2 my-5 w-full">
          {navMockData.map((item, index) => {
            return (
              <NavigationItem
                title={item.title}
                icon={item.icon}
                key={item.title}
                url={item.url}
                mobile={false}
              />
            );
          })}
        </ul>
      </div>
      {/* Signout section */}
    </section>
  );
}
