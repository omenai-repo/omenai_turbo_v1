"use client";
import { updateArtworkImpressions } from "@omenai/shared-services/artworks/updateArtworkImpressions";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

function useLikedState(
  initialImpressions: number,
  initialLikeIds: string[],
  sessionId: string | undefined,
  art_id: string
) {
  const queryClient = useQueryClient();

  // Initialize stateful data copy of likes data
  const [likedState, setLikedState] = useState({
    count: initialImpressions,
    ids: initialLikeIds,
  });

  // Import login toggle store
  const { toggleLoginModal } = actionStore();

  useEffect(() => {
    setLikedState({ count: initialImpressions, ids: initialLikeIds });
  }, [initialImpressions, initialLikeIds]);

  // Make async call to update liked state in db
  const { mutateAsync: updateLikesMutation } = useMutation({
    mutationFn: (options: { state: boolean; sessionId: string }) =>
      updateArtworkImpressions(art_id, options.state, options.sessionId),

    onSuccess: async (data) => {
      if (data?.isOk) {
        queryClient.invalidateQueries({ queryKey: ["latest"] });
        queryClient.invalidateQueries({ queryKey: ["trending"] });
        queryClient.invalidateQueries({ queryKey: ["curated"] });
        queryClient.invalidateQueries({ queryKey: ["fetch_saved_artworks"] });
        queryClient.invalidateQueries({ queryKey: ["get_paginated_artworks"] });
      } else {
        setLikedState({ count: initialImpressions, ids: initialLikeIds });
      }
    },
  });

  // handle onClick like button
  const handleLike = async (state: boolean) => {
    // Pop up login modal
    // TODO: Create login modal

    if (sessionId === undefined) {
      toggleLoginModal(true);
    } else {
      if (state) {
        setLikedState((prev) => ({
          count: prev.count + 1,
          ids: [...likedState.ids, sessionId],
        }));
      } else {
        setLikedState((prev) => ({
          count: prev.count - 1,
          ids: likedState.ids.filter((id) => id !== sessionId),
        }));
      }

      // Call useQuery mutation
      await updateLikesMutation({ state, sessionId });
    }
  };

  // Return stateful copy of like data
  return { likedState, handleLike };
}

export default useLikedState;
