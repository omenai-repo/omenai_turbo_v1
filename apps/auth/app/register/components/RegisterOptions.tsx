"use client";
import { useLowRiskFeatureFlag } from "@omenai/shared-hooks/hooks/useConfigCatFeatureFlag";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";

export default function RegisterOptions() {
  const { value: waitlistActivated } = useLowRiskFeatureFlag(
    "waitlistActivated",
    true
  );
  const params = useSearchParams();
  const redirectTo = params.get("redirect");
  return (
    <div className="w-full grid place-items-center">
      <div className="grid xs:grid-cols-2 grid-rows-2 font-medium w-full gap-4">
        <div className="grid xs:grid-cols-2 gap-2 col-span-2 w-full">
          <Link
            href={
              waitlistActivated
                ? "/waitlist?entity=gallery"
                : "/register/gallery"
            }
          >
            <button className="border border-slate-300   bg-transparent text-dark hover:border-slate-800 disabled:cursor-not-allowed focus:ring-0 duration-300 outline-none focus:outline-none disabled:bg-dark/10 disabled:text-white rounded-full py-4 w-full text-center text-fluid-xxs flex items-center justify-center hover:ring-white cursor-pointer">
              Signup as Gallery
            </button>
          </Link>
          <Link
            href={
              waitlistActivated ? "/waitlist?entity=artist" : "/register/artist"
            }
          >
            <button className="border border-slate-300   bg-transparent text-dark hover:border-slate-800 disabled:cursor-not-allowed focus:ring-0 duration-300 outline-none focus:outline-none disabled:bg-dark/10 disabled:text-white rounded-full py-4 w-full text-center text-fluid-xxs flex items-center justify-center hover:ring-white cursor-pointer">
              Signup as Artist
            </button>
          </Link>
        </div>

        <Link
          href={`/register/user?redirect=${redirectTo}`}
          className="w-full items-center col-span-2"
        >
          <button className="border border-slate-300   bg-transparent text-dark hover:border-slate-800 disabled:cursor-not-allowed focus:ring-0 duration-300 outline-none focus:outline-none disabled:bg-dark/10 disabled:text-white rounded-full py-4 w-full text-center text-fluid-xxs flex items-center justify-center hover:ring-white cursor-pointer">
            Signup as Collector
          </button>
        </Link>
        <Link href={"/login"} className="w-full items-center col-span-2">
          <button className="bg-dark gap-x-1 hover:bg-dark/80 text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none  rounded py-4 w-full text-center text-fluid-xxs flex items-center justify-center hover:ring-white cursor-pointer">
            <span>Got an account?</span>{" "}
            <span className="underline">Login</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
