"use client";
import { useQuery } from "@tanstack/react-query";
import PopulartArtworkCard from "./components/PopulartArtworkCard";
import { fetchPopularArtworks } from "@omenai/shared-services/artworks/fetchPopularArtworks";

import { OrderRequestSkeleton } from "@omenai/shared-ui-components/components/skeletons/OrderRequestSkeleton";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import PopularArtworksRanking from "./components/PopulartArtworkCard";

export default function PopularArtworks() {
  const { user } = useAuth({ requiredRole: "artist" });
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
    <div className="p-4 min-h-[200px] flex flex-col bg-white shadow-sm rounded">
      <div className="w-full h-full p-5 ">
        <h1 className="font-medium self-start">Popular artworks</h1>
        <div className="grid place-items-center w-full h-auto mt-4">
          {isLoading ? (
            <OrderRequestSkeleton />
          ) : (
            <>
              {popularArtworks.length === 0 ? (
                <NotFoundData />
              ) : (
                <div className="flex flex-col gap-y-4 w-full" id="tour-search">
                  <PopularArtworksRanking artworks={popularArtworks} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
