import Link from "next/link";
import React from "react";

export default function LoginOptions() {
  return (
    <div className="w-full grid place-items-center">
      <div className="grid grid-cols-2 grid-rows-3 font-medium w-full gap-4">
        <div className="grid xs:grid-cols-2 col-span-2 gap-2">
          <Link href={"/login/gallery"}>
            <button className="hover:bg-dark hover:text-white focus:ring ring-1 border-0 ring-dark/20 hover:ring-dark duration-300 outline-none focus:outline-none focus:ring-dark rounded-md h-[35px] p-6 w-full text-center text-fluid-xs flex items-center justify-center bg-white cursor-pointer">
              Login as Gallery
            </button>
          </Link>
          <Link href={"/login/artist"}>
            <button className="hover:bg-dark hover:text-white focus:ring ring-1 border-0 ring-dark/20 hover:ring-dark duration-300 outline-none focus:outline-none focus:ring-dark rounded-md h-[35px] p-6 w-full text-center text-fluid-xs flex items-center justify-center bg-white cursor-pointer">
              Login as Artist
            </button>
          </Link>
        </div>

        <Link href={"/login/user"} className="w-full items-center col-span-2">
          <button className="hover:bg-dark hover:text-white focus:ring ring-1 border-0 ring-dark/20 hover:ring-dark duration-300 outline-none focus:outline-none focus:ring-dark rounded-md h-[35px] p-6 w-full text-center text-fluid-xs flex items-center justify-center bg-white cursor-pointer">
            Login as Collector
          </button>
        </Link>
        <Link href={"/register"} className="w-full items-center col-span-2">
          <button className="bg-dark hover:bg-dark/80 text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none  rounded-md h-[35px] p-6 w-full text-center text-fluid-xs flex items-center justify-center hover:ring-white cursor-pointer">
            Create an account
          </button>
        </Link>
      </div>
    </div>
  );
}
