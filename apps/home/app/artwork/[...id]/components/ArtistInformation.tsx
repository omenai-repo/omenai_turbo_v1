export function ArtistInformation({
  name,
  year,
  location,
}: {
  name: string;
  year: string;
  location: string;
}) {
  return (
    <div className="w-full bg-neutral-900 text-white p-8 lg:p-12">
      <h3 className="mb-6 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
        About the Artist
      </h3>
      <h4 className="mb-8 font-serif text-3xl italic">{name}</h4>

      <div className="grid grid-cols-2 gap-8 border-t border-white/20 pt-8">
        <div>
          <span className="block text-[10px] uppercase text-neutral-500 mb-1">
            Born
          </span>
          <span className="font-mono text-sm">{year}</span>
        </div>
        <div>
          <span className="block text-[10px] uppercase text-neutral-500 mb-1">
            Origin
          </span>
          <span className="font-mono text-sm">{location}</span>
        </div>
      </div>
    </div>
  );
}
