import React from "react";
import Image from "next/image";
import Form from "./features/adminForm/Form";
export default function page() {
  return (
    <section className="h-[100vh] w-full grid place-items-center overflow-x-hidden">
      <div className="w-fit h-full grid place-items-center">
        {/* Side section */}

        {/* Form section */}
        <div className="w-full h-full p-5 md:px-[50px] overflow-x-hidden">
          <Form />
        </div>
      </div>
    </section>
  );
}
