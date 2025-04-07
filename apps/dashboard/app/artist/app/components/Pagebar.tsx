"use client";
import { useSession } from "@omenai/package-provider/SessionProvider";
import { ArtistSchemaTypes } from "@omenai/shared-types";
import Greeting from "./Greetings";
import { AiOutlinePlus } from "react-icons/ai";

export default function Pagebar() {
  const session = useSession() as ArtistSchemaTypes;
  const name_split = (session as ArtistSchemaTypes).name.split(" ");

  return (
    <div className="w-full px-5 h-[4rem] flex justify-between items-center">
      <Greeting name={name_split[0]} />
      <button className="h-[40px] px-4 rounded-full w-fit flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-[14px] font-normal">
        Upload artwork
        <AiOutlinePlus className="text-white" />
      </button>
    </div>
  );
}
