"use client";
import useLikedState from "@omenai/shared-hooks/hooks/useLikedState";
import { IoIosHeart } from "react-icons/io";
import { IoHeartOutline } from "react-icons/io5";

export default function LikeComponent({
  sessionId,
  impressions,
  likeIds,
  art_id,
}: {
  impressions: number;
  likeIds: string[];
  sessionId: string | undefined;
  art_id: string;
}) {
  const { likedState, handleLike } = useLikedState(
    impressions,
    likeIds,
    sessionId,
    art_id,
  );

  return (
    <span className="grid place-items-center bg-[#fff] p-2 rounded-full">
      {/* <span className="text-fluid-xxs text-dark">{likedState.count}</span> */}
      {(sessionId === undefined ||
        (sessionId && !likedState.ids.includes(sessionId))) && (
        <IoHeartOutline
          className={` cursor-pointer `}
          size={18}
          onClick={() => handleLike(true)}
        />
      )}
      {sessionId !== undefined && likedState.ids.includes(sessionId) && (
        <IoIosHeart
          className={` text-red-600 cursor-pointer `}
          size={18}
          onClick={() => handleLike(false)}
        />
      )}
    </span>
  );
}
