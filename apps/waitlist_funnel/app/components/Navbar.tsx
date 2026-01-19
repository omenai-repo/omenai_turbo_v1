import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";
export const Navbar = () => (
  <nav className="bg-white absolute top-0 left-0 right-0 z-20 px-6 py-6 md:px-12 flex justify-between items-end">
    <IndividualLogo />
    <div className="flex items-center gap-2 border border-black/10 bg-white/50 backdrop-blur-md px-3 py-1 rounded-full">
      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-600">
        Applications Open
      </span>
    </div>
  </nav>
);
