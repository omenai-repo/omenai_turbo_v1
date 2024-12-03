"use client";

import { getPromotionalData } from "@omenai/shared-services/promotionals/getPromotionalContent";
import { useQuery } from "@tanstack/react-query";
import PromotionalCard from "./PromotionalCard";
import { ObjectId } from "mongoose";
import { PromotionalSchemaTypes } from "@omenai/shared-types";
import Load from "@omenai/shared-ui-components/components/loader/Load";

export default function ManagePromoContent() {
  const { data: contents, isLoading: loading } = useQuery({
    queryKey: ["promotional_data"],
    queryFn: async () => {
      const response = await getPromotionalData();

      if (response?.isOk) {
        return response.data;
      } else throw new Error("Something went wrong");
    },
    refetchOnWindowFocus: false,
  });

  if (loading) {
    return (
      <div className="h-[75vh] w-full grid place-items-center">
        <Load />
      </div>
    );
  }
  return (
    <div>
      <div className=" mt-5 my-[3rem]">
        <h1 className="divide-y text-sm ">My promotional contents</h1>
      </div>
      <div className="grid grid-cols-4 gap-5">
        {contents.map(
          (
            content: PromotionalSchemaTypes & {
              createdAt: string;
              updatedAt: string;
              _id: ObjectId;
            }
          ) => {
            return (
              <PromotionalCard
                key={content.createdAt}
                headline={content.headline}
                subheadline={content.subheadline}
                image={content.image}
                cta={content.cta}
                id={content._id}
              />
            );
          }
        )}
      </div>
    </div>
  );
}
