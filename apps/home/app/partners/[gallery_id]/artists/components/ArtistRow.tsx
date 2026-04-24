import ArtworkCard from "@omenai/shared-ui-components/components/artworks/ArtworkCard";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";

export const ArtistRow = ({
  artist,
  galleryId,
}: {
  artist: any;
  galleryId: string;
}) => {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const metadataStr = [artist.country_of_origin, artist.birthyear]
    .filter(Boolean)
    .join(", b. ");

  return (
    <div className="w-full pb-16 border-b border-neutral-100 last:border-0 mb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pr-4 md:pr-8 lg:pr-12">
        <div>
          <Link
            href={`/partners/${galleryId}/works?artist=${artist.artist_id}`}
            className="group inline-block"
          >
            <h3
              className={`text-dark group-hover:text-neutral-500 transition-colors ${
                artist.isRepresented
                  ? "font-serif text-xl md:text-2xl leading-none"
                  : "font-sans text-xl md:text-2xl font-medium"
              }`}
            >
              {artist.name}
            </h3>
          </Link>
          {metadataStr && (
            <p className="font-sans text-xs text-neutral-400 uppercase tracking-widest mt-2">
              {metadataStr}
            </p>
          )}
        </div>

        {artist.totalWorks > 0 && (
          <Link
            href={`/partners/${galleryId}/works?artist=${artist.artist_id}`}
            className="font-sans text-[10px] uppercase tracking-widest font-medium text-dark hover:text-neutral-500 transition-colors border-b border-dark hover:border-neutral-500 pb-1 self-start md:self-auto"
          >
            View All ({artist.totalWorks})
          </Link>
        )}
      </div>

      <div className="min-h-[300px]">
        {artist.totalWorks === 0 ? (
          <div className="w-full py-16 flex flex-col items-center justify-center bg-neutral-50 border border-neutral-100 rounded-sm mr-4 md:mr-8 lg:mr-12">
            <p className="font-sans text-xs text-neutral-500 uppercase tracking-widest">
              No works currently available.
            </p>
          </div>
        ) : (
          <div
            className="overflow-hidden w-full pr-4 md:pr-8 lg:pr-12"
            ref={emblaRef}
          >
            <div className="flex touch-pan-y space-x-6 md:space-x-8">
              {artist.artworks.map((art: any) => (
                <div
                  key={art.art_id}
                  className="flex-[0_0_85%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_22%] min-w-0"
                >
                  <ArtworkCard
                    image={art.url}
                    name={art.title}
                    artist={art.artist}
                    art_id={art.art_id}
                    pricing={art.pricing}
                    impressions={art.impressions || 0}
                    likeIds={art.like_IDs || []}
                    sessionId={undefined}
                    availability={art.availability}
                    medium={art.medium}
                    author_id={art.author_id}
                  />
                </div>
              ))}

              {artist.totalWorks > 10 && (
                <div className="flex-[0_0_85%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_22%] min-w-0 h-full">
                  <Link
                    href={`/partners/${galleryId}/works?artist=${artist.artist_id}`}
                    className="flex flex-col items-center justify-center h-full min-h-[400px] bg-neutral-50 border border-neutral-100 hover:border-dark hover:bg-white transition-colors duration-300 group rounded-sm"
                  >
                    <span className="font-serif text-xl text-dark mb-2">
                      View All Works
                    </span>
                    <span className="font-sans text-[10px] uppercase tracking-widest text-neutral-500 group-hover:text-dark transition-colors">
                      {artist.totalWorks - 10} more available
                    </span>
                    <svg
                      className="w-6 h-6 text-neutral-400 mt-4 group-hover:text-dark transition-colors group-hover:translate-x-1 duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
