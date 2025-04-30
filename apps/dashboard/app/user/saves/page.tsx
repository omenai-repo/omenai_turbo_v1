"use client";

import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { useWindowSize } from "usehooks-ts";
import { fetchUserSaveArtworks } from "@omenai/shared-services/artworks/fetchUserSavedArtworks";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { catalogChunk } from "@omenai/shared-utils/src/createCatalogChunks";
import { auth_uri } from "@omenai/url-config/src/config";
import ArtworkCard from "@omenai/shared-ui-components/components/artworks/ArtworkCard";
import { userDashboardActionStore } from "@omenai/shared-state-store/src/dashboard/individual/userDashboardActionState";
import Pagination from "@omenai/shared-ui-components/components/pagination/Pagination";
import { ArtworksListingSkeletonLoader } from "@omenai/shared-ui-components/components/loader/ArtworksListingSkeletonLoader";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";

export default function Saves() {
  const {
    artworks,
    setArtworks,
    isLoading,
    setIsLoading,
    artwork_total,
    set_artwork_total,
    setPageCount,
    pageCount,
    current_page,
    set_current_page,
  } = userDashboardActionStore();
  const { session } = useContext(SessionContext);
  const router = useRouter();
  const { width } = useWindowSize();
  const auth_url = auth_uri();

  if (session === null || session === undefined)
    router.replace(`${auth_url}/login`);

  const { data: artworksArray, isLoading: loading } = useQuery({
    queryKey: ["fetch_saved_artworks"],
    queryFn: async () => {
      const response = await fetchUserSaveArtworks(1);
      if (!response?.isOk) throw new Error("Something went wrong");
      else {
        setArtworks(response?.data);
        set_artwork_total(response?.total);
        setPageCount(response?.count);
      }
      return response.data;
    },
    refetchOnWindowFocus: false,
    gcTime: 0,
  });

  if (loading || isLoading) {
    return <ArtworksListingSkeletonLoader />;
  }

  if (!artworksArray || artworksArray.length === 0 || artworks.length === 0) {
    return (
      <div className="w-full h-full grid place-items-center my-12">
        <NotFoundData />
      </div>
    );
  }
  const arts = catalogChunk(
    artworks,
    width <= 640 ? 1 : width <= 990 ? 2 : width <= 1440 ? 3 : 4
  );

  return (
    <div className="p-2">
      <>
        <p className="text-fluid-xs font-bold my-4">
          {artwork_total} artworks:
        </p>

        <div className="flex flex-wrap gap-x-4 justify-center">
          {arts.map((artworks: any[], index) => {
            return (
              <div className="flex-1 gap-2 space-y-6" key={index}>
                {artworks.map((art: any) => {
                  return (
                    <ArtworkCard
                      key={art.art_id}
                      image={art.url}
                      name={art.title}
                      artist={art.artist}
                      art_id={art.art_id}
                      pricing={art.pricing}
                      impressions={art.impressions as number}
                      likeIds={art.like_IDs as string[]}
                      sessionId={session?.user_id as string | undefined}
                      availability={art.availability}
                      medium={art.medium}
                    />
                  );
                })}
              </div>
            );
          })}
          {/* first */}
        </div>
      </>

      <Pagination
        total={pageCount}
        filterOptions={{ price: [], year: [], medium: [], rarity: [] }}
        fn={fetchUserSaveArtworks}
        setArtworks={setArtworks}
        setCurrentPage={set_current_page}
        setIsLoading={setIsLoading}
        currentPage={current_page}
      />
    </div>
  );
}
