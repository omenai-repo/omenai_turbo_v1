export default function Newsletter() {
  return (
    <section className="w-full border-t border-neutral-200 bg-white py-8 md:py-24 lg:py-32">
      <div className="px-4 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-16 lg:flex-row lg:items-center">
          {/* 1. EDITORIAL HOOK (Left Column) */}
          <div className="max-w-xl space-y-6">
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-dark">
              Market Intelligence
            </span>

            <h2 className="font-serif text-4xl text-neutral-900 md:text-5xl">
              Join the{" "}
              <span className="italic text-neutral-500">Inner Circle.</span>
            </h2>

            <p className="font-sans text-sm leading-relaxed text-neutral-600">
              Receive weekly editorials, market analysis, and collector
              insights. No noise, just art.
            </p>

            {/* Trust Signal */}
            {/* <div className="flex items-center gap-3 pt-4">
              <div className="h-[1px] w-8 bg-neutral-300" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                Read by 5,000+ Collectors
              </span>
            </div> */}
          </div>

          {/* 2. THE EMBED (Right Column) */}
          {/* We frame the iframe to look like a physical card */}
          <div className="w-full max-w-lg overflow-hidden border border-neutral-200 bg-[#fafafa]">
            <iframe
              title="Omenai Newsletter"
              src="https://omenai.substack.com/embed"
              style={{ background: "#fafafa" }}
              className="h-[320px] w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
