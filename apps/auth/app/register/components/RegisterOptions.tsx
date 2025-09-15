import Link from "next/link";
import React from "react";

export default function RegisterOptions() {
  return (
    <div className="w-full grid place-items-center">
      <div className="grid xs:grid-cols-2 grid-rows-2 font-medium w-full gap-4">
        <div className="grid xs:grid-cols-2 gap-2 col-span-2 w-full">
          <Link href={"/register/gallery"}>
            <button className="hover:bg-dark hover:text-white focus:ring ring-1 border-0 ring-dark/20 hover:ring-dark duration-300 outline-none focus:outline-none focus:ring-dark rounded h-[35px] p-5 w-full text-center text-fluid-xs flex items-center justify-center bg-white cursor-pointer">
              Signup as Gallery
            </button>
          </Link>
          <Link href={"/register/artist"}>
            <button className="hover:bg-dark hover:text-white focus:ring ring-1 border-0 ring-dark/20 hover:ring-dark duration-300 outline-none focus:outline-none focus:ring-dark rounded h-[35px] p-5 w-full text-center text-fluid-xs flex items-center justify-center bg-white cursor-pointer">
              Signup as Artist
            </button>
          </Link>
        </div>

        <Link
          href={"/register/user"}
          className="w-full items-center col-span-2"
        >
          <button className="hover:bg-dark hover:text-white focus:ring ring-1 border-0 ring-dark/20 hover:ring-dark duration-300 outline-none focus:outline-none focus:ring-dark rounded h-[35px] p-5 w-full text-center text-fluid-xs flex items-center justify-center bg-white cursor-pointer">
            Signup as Collector
          </button>
        </Link>
        <Link href={"/login"} className="w-full items-center col-span-2">
          <button className="bg-dark gap-x-1 hover:bg-dark/80 text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none  rounded h-[35px] p-5 w-full text-center text-fluid-xs flex items-center justify-center hover:ring-white cursor-pointer">
            <span>Got an account?</span>{" "}
            <span className="underline">Login</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
