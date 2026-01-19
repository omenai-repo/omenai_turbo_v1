export default function Newsletter() {
  return (
    <section className="w-full border-t border-neutral-200 bg-white py-8 md:py-24 lg:py-32">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-16 lg:flex-row lg:items-center">
          {/* 1. EDITORIAL HOOK (Left Column) */}
          <div className="max-w-xl space-y-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">
              Correspondence
            </span>

            <h2 className="font-serif text-5xl text-neutral-900 md:text-6xl">
              Join the{" "}
              <span className="italic text-neutral-500">Inner Circle.</span>
            </h2>

            <p className="font-sans text-sm leading-relaxed text-neutral-600">
              Receive our weekly curatorial notes, market analysis, and
              invitations to private viewing rooms. No noise, just art.
            </p>

            {/* Trust Signal */}
            <div className="flex items-center gap-3 pt-4">
              <div className="h-[1px] w-8 bg-neutral-300" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                Read by 5,000+ Collectors
              </span>
            </div>
          </div>

          {/* 2. THE EMBED (Right Column) */}
          {/* We frame the iframe to look like a physical card */}
          <div className="w-full max-w-lg overflow-hidden border border-neutral-200 bg-[#fafafa]">
            <iframe
              title="Omenai Newsletter"
              src="https://omenai.substack.com/embed"
              style={{ background: "#fafafa" }}
              // Reduced height to 320px to cut off Substack's excess whitespace if possible,
              // or keep 500px if it displays a feed.
              className="h-[320px] w-full"
              frameBorder="0"
              scrolling="no"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
