import Image from "next/image";
import React from "react";
import LoginOptionWrapper from "./components/LoginOptionWrapper";

export const dynamic = "force-dynamic";

function Page() {
  return (
    <section className="h-[100vh] w-full overflow-x-hidden">
      <div className="w-full h-full md:grid grid-cols-2">
        {/* Side section */}
        <div className="h-full w-full relative flex-1 hidden md:block">
          <Image
            src={"/login_banner.png"}
            alt="Individual sign up image block"
            width={960}
            height={1024}
            className="absolute inset-0 w-full h-full object-center object-cover"
          />
        </div>

        {/* Login options section */}
        <LoginOptionWrapper />
      </div>
    </section>
  );
}

export default Page;
