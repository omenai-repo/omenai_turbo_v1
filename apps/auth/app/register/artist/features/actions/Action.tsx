import Link from "next/link";

export default function Action() {
  return (
    <div className=" flex justify-between items-center w-full px-4 space-y-2 text-center mt-6 flex-col sm:flex-row md:flex-col lg:flex-row">
      <p className="font-normal text-[14px]">
        <Link
          href={"/register"}
          className="text-gray-700 font-normal underline"
        >
          Create account?{" "}
        </Link>
      </p>
      <p className="font-normal text-[14px]">
        Got an account?{" "}
        <Link href={"/login"} className="text-gray-700 font-medium underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
