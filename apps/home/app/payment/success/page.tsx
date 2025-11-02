"use client";
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
      <div className="w-full min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center space-y-6 animate-fade-in">
          {/* Success Icon */}
          <div className="flex justify-center">
            <Image
              height={100}
              width={100}
              src={"/images/done.png"}
              alt="success-icon"
              className="animate-scale-in"
            />
          </div>

          {/* Headline */}
          <h2 className="text-xl font-semibold text-dark">
            Payment Successful 🎉
          </h2>

          {/* Subtext */}
          <p className="text-sm text-gray-600 leading-relaxed">
            Your payment has been completed successfully. Your order will be on
            its way to you shortly.
          </p>

          {/* Actions */}
          <div className="flex sm:flex-row flex-col gap-3 justify-center items-center pt-4">
            <Link
              href="/"
              className="h-[40px] px-5 rounded-lg flex items-center justify-center gap-2 bg-gray-800 text-dark text-sm font-medium shadow hover:bg-gray-700 hover:text-white transition-colors duration-300"
              title="Return Home"
            >
              Return Home
            </Link>

            <Link
              href={`${dashboard_uri}/user/orders`}
              className="h-[40px] px-5 rounded-lg flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-medium shadow hover:bg-indigo-500 transition-colors duration-200"
              title="Return to dashboard"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Mild Animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </>
  );
}
