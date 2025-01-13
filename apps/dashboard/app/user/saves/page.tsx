"use client";

import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { useWindowSize } from "usehooks-ts";
import { fetchUserSaveArtworks } from "@omenai/shared-services/artworks/fetchUserSavedArtworks";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { catalogChunk } from "@omenai/shared-utils/src/createCatalogChunks";
import { login_url } from "@omenai/url-config/src/config";
import ArtworkCard from "@omenai/shared-ui-components/components/artworks/ArtworkCard";

export default function Saves() {
  const { session } = useContext(SessionContext);
  const router = useRouter();
  const { width } = useWindowSize();
  const auth_url = auth_uri();

  if (session === null || session === undefined)
    router.replace(`${auth_url}/login`);

  const { data: artworks, isLoading } = useQuery({
    queryKey: ["fetch_saved_artworks"],
    queryFn: async () => {
      const artworks = await fetchUserSaveArtworks();
      if (!artworks) throw new Error("Something went wrong");
      else return artworks.data;
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="h-[50vh] w-full grid place-items-center">
        <Load />
      </div>
    );
  }
  const arts = catalogChunk(
    artworks,
    width < 400 ? 1 : width < 768 ? 2 : width < 1280 ? 3 : width < 1440 ? 4 : 5
  );

  return (
    <div className="p-2">
      {artworks.length === 0 ? (
        <div className="w-full h-[50vh] grid place-items-center">
          <p>Like an artwork to add it here.</p>
        </div>
      ) : (
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
                    />
                  );
                })}
              </div>
            );
          })}
          {/* first */}
        </div>
      )}
    </div>
  );
}
