"use client";
import { useQuery } from "@tanstack/react-query";
import GalleryListItem from "./GalleryListItem";

import { AnimatePresence, motion } from "framer-motion";
import { fetchGalleriesOnVerifStatus } from "@omenai/shared-services/admin/fetch_galleries_on_verif_status";
import { AdminGalleryListItemTypes } from "@omenai/shared-types";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
export default function VerifiedGalleryList() {
  const { data: galleries, isLoading } = useQuery({
    queryKey: ["fetch_verified_galleries"],
    queryFn: async () => {
      const res = await fetchGalleriesOnVerifStatus(true);

      if (res?.isOk) {
        return res.data;
      }
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="h-[85vh] w-full grid place-items-center">
        <Load />
      </div>
    );
  }

  if (galleries.length === 0) {
    return (
      <div className="h-[85vh] w-full grid place-items-center">
        <NotFoundData />
      </div>
    );
  }
  return (
    <AnimatePresence key={2}>
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
                  verified={true}
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
