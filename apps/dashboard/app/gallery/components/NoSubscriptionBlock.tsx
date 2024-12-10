import Link from "next/link";
import { BsShieldLock } from "react-icons/bs";
export default function NoSubscriptionBlock() {
  return (
    <div
      className={`w-full h-[75vh] grid place-items-center bg-dark mt-10 rounded-lg`}
    >
      <div className="flex flex-col gap-4 items-center">
        <BsShieldLock className="text-2xl text-white" />
        <div className="text-center mb-3">
          <p className=" text-white">
            Your need to have an active subscription to use this feature.
          </p>
        </div>
        <Link href={"/gallery/billing/plans"} className="">
          <button className=" h-[40px] px-4 bg-white text-dark rounded-sm ">
            Activate Subscription
          </button>
        </Link>
      </div>
    </div>
  );
}
