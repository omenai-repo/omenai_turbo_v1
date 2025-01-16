"use client";
import Image from "next/image";
import React from "react";
import { useLoginStore } from "@omenai/shared-state-store/src/auth/login/LoginStore";
import IndividualLoginForm from "../features/individualForm/Form";

function Page() {
  const { current } = useLoginStore();

  return (
    <section className="h-[100vh] w-full xl:container py-12 px-4 grid place-items-center overflow-x-hidden">
      <div className="w-full h-full md:grid grid-cols-2">
        {/* Side section */}
        <div className="h-full w-full relative flex-1 hidden md:block">
          <Image
            src={"/user_banner.png"}
            alt="Individual sign up image block"
            width={960}
            height={1024}
            className="absolute inset-0 w-full rounded-[20px] h-full object-center object-cover"
          />
        </div>

        {/* Form section */}
        <div className="w-full h-full p-5 lg:px-[50px] overflow-x-hidden">
          <IndividualLoginForm />
        </div>
      </div>
    </section>
  );
}

export default Page;
