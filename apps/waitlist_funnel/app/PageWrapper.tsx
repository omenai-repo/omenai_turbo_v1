import { RegistrationTerminal } from "./components/form/RegisterationTerminal";
import { HeroManifesto } from "./components/HeroManifesto";

export default function WaitlistPage() {
  return (
    <main className="min-h-screen bg-white h-full text-dark selection:bg-neutral-900 selection:text-white overflow-hidden">
      {/* <Navbar /> */}

      {/* SPLIT SCREEN LAYOUT 
        lg:grid-cols-[1.2fr_1fr] gives slightly more weight to the manifesto side 
        for a better editorial feel.
      */}
      <div className="lg:h-screen w-full grid grid-cols-1 lg:grid-cols-[1.2fr_1fr]">
        {/* LEFT PANEL: Manifesto & Visuals */}
        <div className="relative h-full px-6 pb-16 md:px-12 lg:pb-0 lg:overflow-y-auto scrollbar-hide">
          <HeroManifesto />
        </div>

        {/* RIGHT PANEL: Acquisition Terminal */}
        <div className="relative h-full bg-neutral-50 lg:overflow-y-auto scrollbar-hide z-10 shadow-2xl lg:shadow-none">
          <RegistrationTerminal />
        </div>
      </div>
    </main>
  );
}
