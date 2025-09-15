import Link from "next/link";
import { BsShieldLock } from "react-icons/bs";
export default function NoSubscriptionBlock() {
  return (
    <div
      className={`w-full h-[75vh] grid place-items-center bg-dark mt-10 rounded`}
    >
      <div className="flex flex-col gap-4 items-center">
        <BsShieldLock className="text-fluid-2xl text-white" />
        <div className="text-center mb-3">
          <p className=" text-white">
            Your need to have an active subscription to use this feature.
          </p>
        </div>
        <Link href={"/gallery/billing/plans"} className="">
          <button className="bg-white whitespace-nowrap hover:bg-dark/80 hover:text-white disabled:cursor-not-allowed text-dark focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none disabled:bg-dark/10 disabled:text-white rounded h-[35px] p-5 w-full text-center text-fluid-xs flex items-center justify-center hover:ring-white cursor-pointer">
            Activate Subscription
          </button>
        </Link>
      </div>
    </div>
  );
}
