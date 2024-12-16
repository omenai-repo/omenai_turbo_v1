import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import Image from "next/image";
import Link from "next/link";

export default function OrderCompletedPage() {
  return (
    <>
      <DesktopNavbar />
      <div className="w-full h-[95vh] grid place-items-center">
        <div className="p-6 grid text-center place-items-center space-y-4">
          <p className="text-base">
            Your payment has been completed successfuly. Your order will be on
            it&apos;s way to you shortly
          </p>
          <Image
            height={100}
            width={100}
            src={"/images/done.png"}
            alt="success-icon"
          />

          <div className="flex space-x-2 items-center">
            <Link
              href="/"
              className="flex items-center whitespace-nowrap justify-center space-x-2 h-[40px] px-4 w-full bg-black text-white cursor-pointer mt-[50px] transition duration-150"
              title="Return Home"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="text-[14px]">Return Home</span>
            </Link>
            <Link
              href="/dashboard/user/orders"
              className="flex items-center whitespace-nowrap justify-center space-x-2 h-[40px] px-4 w-full bg-black text-white cursor-pointer mt-[50px] transition duration-150"
              title="Return Home"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="text-[14px]">Return to dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
