"use client";
import Image from "next/image";
import AdminLoginForm from "./AdminLoginForm";

function Page() {
  return (
    <section className="h-[100vh] overflow-x-hidden">
      <div className="w-full h-full md:grid grid-cols-2">
        {/* Side section */}
        <div className="h-full w-full relative flex-1 hidden md:block">
          <Image
            src={"/dark_bg_1.jpg"}
            alt="Artist sign up image block"
            width={960}
            height={1024}
            className="absolute inset-0 w-full h-full object-center object-cover aspect-auto"
          />
        </div>

        {/* Form section */}
        <div className="w-full max-w-sm h-full container overflow-x-hidden">
          <AdminLoginForm />
        </div>
      </div>
    </section>
  );
}

export default Page;
