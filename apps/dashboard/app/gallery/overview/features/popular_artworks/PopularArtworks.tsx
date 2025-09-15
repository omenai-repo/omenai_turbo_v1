"use client";
import { useQuery } from "@tanstack/react-query";
import PopulartArtworkCard from "./components/PopulartArtworkCard";
import { fetchPopularArtworks } from "@omenai/shared-services/artworks/fetchPopularArtworks";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { OrderRequestSkeleton } from "@omenai/shared-ui-components/components/skeletons/OrderRequestSkeleton";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function PopularArtworks() {
  const { user } = useAuth({ requiredRole: "gallery" });
  const { data: popularArtworks, isLoading } = useQuery({
    queryKey: ["get_overview_ppular_artwork"],
    queryFn: async () => {
      const data = await fetchPopularArtworks(user.id);
      if (data?.isOk) {
        return data.data;
      }
    },
    refetchOnWindowFocus: false,
  });

  return (
    <div className="p-4 min-h-[300px] flex flex-col gap-y-4">
      <div className="w-full h-full ring-1 ring-[#eeeeee] p-6 rounded">
        <h1 className="font-medium self-start">Popular artworks</h1>
        <div className="grid place-items-center w-full h-full">
          {isLoading ? (
            <OrderRequestSkeleton />
          ) : (
            <>
              {popularArtworks.length === 0 ? (
                <NotFoundData />
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
