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
    art_id
  );

  return (
    <span className="flex space-x-1 flex items-center justify-center bg-[#fff] h-[40px] w-[40px] rounded-full">
      {/* <span className="text-fluid-xs text-dark">{likedState.count}</span> */}
      {(sessionId === undefined ||
        (sessionId && !likedState.ids.includes(sessionId))) && (
        <IoHeartOutline
          className={`text-[18px]  cursor-pointer `}
          size={22}
          onClick={() => handleLike(true)}
        />
      )}
      {sessionId !== undefined && likedState.ids.includes(sessionId) && (
        <IoIosHeart
          className={`text-[18px] text-red-600 cursor-pointer `}
          size={22}
          onClick={() => handleLike(false)}
        />
      )}
    </span>
  );
}
