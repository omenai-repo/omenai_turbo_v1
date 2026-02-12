import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";
import { Navbar } from "./Navbar";

export const HeroManifesto = () => {
  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-center min-h-full pt-24 pb-4 lg:pb-16 px-2 relative">
        {/* Subtle Background Accent (Optional - adds depth) */}
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-emerald-50/50 blur-3xl -z-10 pointer-events-none opacity-50"></div>

        {/* 1. The Hook (Typography) */}
        <div className="mb-16 space-y-8">
          <h1 className="font-serif text-2xl md:text-3xl lg:text-fluid-4xl xl:text-5xl font-light leading-[0.9] text-dark tracking-normal text-balance">
            Are you ready to shape the new Contemporary African Art landscape?
          </h1>
          {/* Added color accent to the border-l */}
          <h2 className="font-sans text-lg md:text-xl leading-relaxed text-slate-800 text-balance max-w-xl border-l-4 border-emerald-700 pl-6">
            What if the next wave of collectors met the next generation of
            artists?
          </h2>
        </div>

        <CountdownTimer />

        {/* 3. The Pitch (Body Text) */}
        <div className="max-w-2xl mb-24">
          <p className="font-sans text-sm md:text-md leading-loose text-slate-600 text-balance">
            We are changing how Contemporary African Art is discovered, bought,
            and sold. Not another overwhelming marketplace, difficult to
            navigate with endless artworks, but a platform with
            {/* Color highlight on key phrase */}
            <span className="text-emerald-800 font-semibold px-1">
              real solutions
            </span>
            designed for the creative and the curious. If you are an artist,
            collector, or both - we want you to be part of the change.
          </p>
        </div>

        {/* 4. The Promises (Pillars) - REVAMPED FOR PROMINENCE */}
        <div className="flex flex-col gap-8">
          {[
            { title: "Less Barriers.", desc: "Streamlined access." },
            { title: "More Exposure.", desc: "Global visibility." },
            { title: "Better Connections.", desc: "Direct engagement." },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-stretch gap-6 group cursor-default"
            >
              {/* The accent line - expands and changes color on hover */}
              <div className="w-1 bg-slate-200 group-hover:bg-emerald-500 transition-all duration-500 ease-out relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              </div>

              <div>
                {/* Title - Large, sans, turns Emerald on hover */}
                <h3 className="font-sans text-2xl md:text-3xl  text-dark group-hover:text-emerald-800 transition-colors duration-300 flex items-center gap-4">
                  {item.title}
                  <ArrowRight
                    className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 text-emerald-500"
                    size={24}
                  />
                </h3>
                {/* Optional tiny descriptor */}
                <p className=" text-[10px] uppercase tracking-widest text-slate-400 group-hover:text-emerald-600/70 transition-colors duration-300 mt-1">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
