"use client";
import { adminModals } from "@omenai/shared-state-store/src/admin/AdminModalsStore";
import React from "react";

export default function GalleryDetailPopupModal() {
  const {
    openGalleryDetailPopupModal,
    singleGalleryListItemData,
    setOpenGalleryDetailPopupModal,
  } = adminModals();

  return (
    <div
      onClick={() => setOpenGalleryDetailPopupModal(false)}
      className={`${
        openGalleryDetailPopupModal ? "grid" : "hidden"
      } w-full h-screen fixed top-0 left-0 backdrop-blur-lg place-items-center bg-dark/10`}
    >
      <div className="bg-white p-5 rounded-md w-[500px]">
        <h1 className="text-base font-normal mb-4">Gallery Information</h1>
        <div className="flex flex-col gap-y-2 text-[14px]">
          <p>Name: {singleGalleryListItemData.name}</p>
          <p>Email: {singleGalleryListItemData.email}</p>
          <p>
            Location: {singleGalleryListItemData.address.address_line},
            {singleGalleryListItemData.address.city},{" "}
            {singleGalleryListItemData.address.state},{" "}
            {singleGalleryListItemData.address.country}
          </p>
          <p>Admin: {singleGalleryListItemData.admin}</p>
          <p>Description: {singleGalleryListItemData.description}</p>
        </div>
      </div>
    </div>
  );
}
