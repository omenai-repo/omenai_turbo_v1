import React from "react";
import ImageBlock from "../../register/gallery/features/image/Image";
import InviteForm from "./InviteForm";

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ entity: string | undefined }>;
}) {
  const entity = (await searchParams).entity;
  if (!entity) return;
  return (
    <section className="h-[100vh] overflow-x-hidden">
      <div className="w-full h-full md:grid grid-cols-2">
        {/* Side section */}
        <div className="h-full w-full relative flex-1 hidden md:block">
          <ImageBlock />
        </div>

        <section className="overflow-hidden bg-white flex items-center justify-center relative">
          {/* --- Background Mesh of Dots (Subtle and Unique) --- */}
          <div
            className="absolute inset-0 z-0 opacity-70"
            style={{
              // Uses a subtle CSS background image for the dot mesh effect
              backgroundImage: `radial-gradient(circle, #d4d4d4 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
            }}
          />

          {/* --- Centered waitlist Form --- */}
          <div className="relative z-10 w-full max-w-lg p-4">
            <InviteForm entity={entity} />
          </div>

          {/* --- Aesthetic Bottom Corner Branding (Subtle) --- */}
          <div className="absolute bottom-6 right-6 text-xs text-slate-800 font-mono uppercase tracking-widest z-10 hidden sm:block">
            OMENAI INC.
          </div>
        </section>
      </div>
    </section>
  );
}
