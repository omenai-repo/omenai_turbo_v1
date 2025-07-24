import Link from "next/link";

export default function page() {
  return (
    <section className="h-[100vh] w-full py-12 grid place-items-center overflow-x-hidden">
      {/* Login options section */}

      <div className="w-full h-full flex items-center justify-center gap-x-8">
        <div className="flex gap-x-4 justify-center w-full ">
          <Link href={"/login"}>
            <button className="h-[35px] p-5 rounded-xl w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal">
              Login account
            </button>
          </Link>
          <Link href="/register">
            <button className="h-[35px] p-5 rounded-xl w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal">
              Create account
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
