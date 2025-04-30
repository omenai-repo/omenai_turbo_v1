"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CiSearch } from "react-icons/ci";
import { toast } from "sonner";
export default function SearchInput() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const handleEnterKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (searchTerm === "")
        toast.error("Error notification", {
          description: "Please include a search term",
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
      else router.push(`/search?searchTerm=${searchTerm}`);
    }
  };

  const handleIconTrigger = () => {
    if (searchTerm === "")
      toast.error("Error notification", {
        description: "Please include a search term",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    else router.push(`/search?searchTerm=${searchTerm}`);
  };
  return (
    <div className="relative flex w-full justify-between gap-x-5 items-center rounded-sm border bg-transparent border-dark/30">
      <input
        type="text"
        className="w-full h-[35px] bg-transparent px-3 border-none rounded-sm placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-700 focus:border-none focus:ring-0 focus:border-0"
        placeholder="Search for anything"
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleEnterKeyPress}
      />
      <div
        className=" text-[14px] flex items-center gap-x-2 bg-dark rounded-sm text-white w-fit h-full py-2 px-3 cursor-pointer"
        onClick={handleIconTrigger}
      >
        <CiSearch className="text-white" />
      </div>
    </div>
  );
}
