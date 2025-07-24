import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { dashboard_url } from "@omenai/url-config/src/config";
import Image from "next/image";
import Link from "next/link";
export const dynamic = "force-dynamic";

export default function OrderCompletedPage() {
  const dashboard_uri = dashboard_url();
  return (
    <>
      <DesktopNavbar />
      <div className="w-full h-[80vh] grid place-items-center">
        <div className="p-6 grid text-center place-items-center space-y-6">
          <Image
            height={100}
            width={100}
            src={"/images/done.png"}
            alt="success-icon"
          />
          <p className="text-fluid-xs font-medium my-4">
            Your payment has been completed successfuly. Your order will be on
            it&apos;s way to you shortly
          </p>

          <div className="flex sm:flex-row flex-col gap-2 justify-center items-center">
            <Link
              href="/"
              className="h-[35px] p-5 rounded-xl w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal"
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
              <span className="text-fluid-xs whitespace-nowrap">
                Return Home
              </span>
            </Link>
            <Link
              href={`${dashboard_uri}/user/orders`}
              className="h-[35px] p-5 rounded-xl w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal"
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
              <span
                className="text-fluid-xs whitespace-nowrap
              "
              >
                Return to dashboard
              </span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
