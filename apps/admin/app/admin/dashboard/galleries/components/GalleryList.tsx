"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import GalleryListItem from "./GalleryListItem";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { AnimatePresence, motion } from "framer-motion";
import { fetchGalleriesOnVerifStatus } from "@omenai/shared-services/admin/fetch_galleries_on_verif_status";
import { AdminGalleryListItemTypes } from "@omenai/shared-types";
import Load from "@omenai/shared-ui-components/components/loader/Load";

export default function GalleryList() {
  const { data: galleries, isLoading } = useQuery({
    queryKey: ["fetch_non_verified_galleries"],
    queryFn: async () => {
      const res = await fetchGalleriesOnVerifStatus(false);

      if (res?.isOk) {
        return res.data;
      }
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="h-[75vh] w-full grid place-items-center">
        <Load />
      </div>
    );
  }

  if (galleries.length === 0) {
    return (
      <div className="h-[65vh] w-full grid place-items-center">
        <NotFoundData />
      </div>
    );
  }
  return (
    <AnimatePresence key={1}>
      <motion.div
        initial={{ y: 300, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -300 }}
        transition={{ duration: 0.33 }}
        className="w-full"
      >
        <div className="flex flex-col gap-y-4">
          {galleries.map(
            (gallery: AdminGalleryListItemTypes, index: number) => {
              return (
                <GalleryListItem
                  key={gallery._id}
                  name={gallery.name}
                  location={gallery.location}
                  description={gallery.description}
                  _id={gallery._id}
                  email={gallery.email}
                  admin={gallery.admin}
                  logo={gallery.logo}
                  gallery_id={gallery.gallery_id}
                  verified={false}
                  status={gallery.status}
                />
              );
            }
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
