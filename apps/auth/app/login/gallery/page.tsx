"use client";
import Image from "next/image";
import React from "react";
import { useLoginStore } from "@omenai/shared-state-store/src/auth/login/LoginStore";
import GalleryLoginForm from "../features/galleryForm/Form";

function Page() {
  const { current } = useLoginStore();

  return (
    <section className="h-[100vh] overflow-x-hidden">
      <div className="w-full h-full md:grid grid-cols-2">
        {/* Side section */}
        <div className="h-full w-full relative flex-1 hidden md:block">
          <Image
            src={"/gallery__banner.png"}
            alt="Gallery sign up image block"
            width={960}
            height={1024}
            className="absolute inset-0 w-full h-full object-center object-cover"
          />
        </div>

        {/* Form section */}
        <div className="w-fit h-full container overflow-x-hidden">
          <GalleryLoginForm />
        </div>
      </div>
    </section>
  );
}

export default Page;
