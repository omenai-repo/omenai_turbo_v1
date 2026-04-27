"use client";
import { updateArtworkImpressions } from "@omenai/shared-services/artworks/updateArtworkImpressions";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

function useLikedState(
  initialImpressions: number,
  initialLikeIds: string[],
  sessionId: string | undefined,
  art_id: string,
) {
  const queryClient = useQueryClient();

  const [likedState, setLikedState] = useState({
    count: initialImpressions,
    ids: initialLikeIds,
  });

  const { csrf } = useAuth({ requiredRole: "user" });
  const { toggleLoginModal } = actionStore();

  useEffect(() => {
    setLikedState({ count: initialImpressions, ids: initialLikeIds });
  }, [initialImpressions, initialLikeIds]);

  const { mutateAsync: updateLikesMutation } = useMutation({
    mutationFn: (options: { state: boolean; sessionId: string }) =>
      updateArtworkImpressions(
        art_id,
        options.state,
        options.sessionId,
        csrf || "",
      ),
    onSuccess: async (data) => {
      if (data?.isOk) {
        // CORRECTION 1: Only invalidate this specific artwork's query
        queryClient.invalidateQueries({ queryKey: ["artwork", art_id] });
      } else {
        // Rollback
        setLikedState({ count: initialImpressions, ids: initialLikeIds });
      }
    },
    // CORRECTION 3: Rollback on network errors
    onError: () => {
      setLikedState({ count: initialImpressions, ids: initialLikeIds });
    },
  });

  const handleLike = async (state: boolean) => {
    if (sessionId === undefined) {
      toggleLoginModal(true);
      return; // Exit early
    }

    if (state) {
      setLikedState((prev) => ({
        count: prev.ids.includes(sessionId) ? prev.count : prev.count + 1,
        // CORRECTION 2 & 4: Use prev.ids and prevent duplicates
        ids: prev.ids.includes(sessionId) ? prev.ids : [...prev.ids, sessionId],
      }));
    } else {
      setLikedState((prev) => ({
        count: !prev.ids.includes(sessionId) ? prev.count : prev.count - 1,
        ids: prev.ids.filter((id) => id !== sessionId),
      }));
    }

    await updateLikesMutation({ state, sessionId });
  };

  return { likedState, handleLike };
}

export default useLikedState;
