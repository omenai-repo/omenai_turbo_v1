import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
import Image from "next/image";

export default function NoMobileView() {
  return (
    <div className="block md:hidden h-screen w-full p-5">
      {/* <IndividualLogo /> */}
      <div className="h-full w-full grid place-items-center p-5">
        <div className="flex flex-col gap-4 items-center">
          <Image src="/icons/computer.webp" alt="" width={50} height={50} />
          <p className="text-base text-center">
            For optimal experience, please visit this page on a desktop or
            tablet device.
          </p>
        </div>
      </div>
    </div>
  );
}
