"use client";
import { useQuery } from "@tanstack/react-query";
import OverviewComponentCard from "../../components/OverviewComponentCard";
import PopulartArtworkCard from "./components/PopulartArtworkCard";
import { fetchPopularArtworks } from "@omenai/shared-services/artworks/fetchPopularArtworks";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import Load from "@omenai/shared-ui-components/components/loader/Load";

export default function PopularArtworks() {
  const { data: popularArtworks, isLoading } = useQuery({
    queryKey: ["get_overview_ppular_artwork"],
    queryFn: async () => {
      const data = await fetchPopularArtworks();
      if (data?.isOk) {
        return data.data;
      }
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading)
    return (
      <div className="h-[40vh] grid place-items-center">
        <Load />
      </div>
    );

  return (
    <>
      <OverviewComponentCard
        fullWidth={false}
        title="Most Popular artworks"
        id="tour-search"
      >
        <div className="w-full">
          {popularArtworks.length === 0 ? (
            <div className="w-full h-full grid pb-10">
              <NotFoundData />
            </div>
          ) : (
            <div className="flex flex-col gap-3 w-full" id="tour-search">
              {popularArtworks.map((artwork: any, index: number) => {
                return (
                  <PopulartArtworkCard
                    key={artwork.title}
                    url={artwork.url}
                    title={artwork.title}
                    artist={artwork.artist}
                    impression_count={artwork.impressions}
                  />
                );
              })}
            </div>
          )}
        </div>
      </OverviewComponentCard>
    </>
  );
}
