"use client";

import { MdClose } from "react-icons/md";
import { IoCheckmarkOutline } from "react-icons/io5";

import { GoEye } from "react-icons/go";
import { adminModals } from "@omenai/shared-state-store/src/admin/AdminModalsStore";
import { AdminGalleryListItemTypes } from "@omenai/shared-types";

export default function GalleryListItem({
  name,
  location,
  description,
  _id,
  email,
  admin,
  logo,
  gallery_id,
  verified,
  status,
}: AdminGalleryListItemTypes & {
  verified: boolean;
}) {
  const {
    setOpenGalleryDetailPopupModal,
    setSingleGalleryListItemData,
    setAcceptConfirmationPopup,
    setRejectConfirmationPopup,
    setBlockGalleryConfirmationPopup,
  } = adminModals();

  function updateGalleryPopupData() {
    setSingleGalleryListItemData({
      name,
      location,
      description,
      _id,
      email,
      admin,
      logo,
      gallery_id,
      status,
    });

    setOpenGalleryDetailPopupModal(true);
  }

  return (
    <div className="w-full p-0">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-[14px] font-normal">{name}</h1>
          <p className="text-[14px] font-normal">{location.address}</p>
          <button
            onClick={updateGalleryPopupData}
            className="flex gap-x-2 w-fit rounded-md items-center h-[40px] px-4 bg-dark text-white"
          >
            <span className="text-[14px] ">View</span>

            <GoEye />
          </button>
        </div>
        {verified ? (
          status === "active" ? (
            <div className={` flex gap-x-4`}>
              <button
                onClick={() =>
                  setBlockGalleryConfirmationPopup({
                    show: true,
                    gallery_id,
                    status: "blocked",
                  })
                }
                className="disabled:cursor-not-allowed disabled:bg-dark/10 flex gap-x-2 w-fit rounded-md items-center h-[40px] px-4 bg-red-600 text-white"
              >
                <span className="text-[14px] ">Block Gallery</span>
              </button>
            </div>
          ) : (
            <div className={` flex gap-x-4`}>
              <button
                onClick={() =>
                  setBlockGalleryConfirmationPopup({
                    show: true,
                    gallery_id,
                    status: "active",
                  })
                }
                className="disabled:cursor-not-allowed disabled:bg-dark/10 flex gap-x-2 w-fit rounded-md items-center  h-[40px] px-4 bg-dark text-white"
              >
                <span className="text-[14px] ">Unblock Gallery</span>
              </button>
            </div>
          )
        ) : (
          <div className={` flex gap-x-4`}>
            <button
              onClick={() =>
                setRejectConfirmationPopup({
                  show: true,
                  email,
                  name,
                  gallery_id,
                })
              }
              className="disabled:cursor-not-allowed disabled:bg-dark/10 flex gap-x-2 w-fit rounded-md items-center h-[40px] px-4 bg-red-600 text-white"
            >
              <span className="text-[14px] ">Reject Gallery</span>

              <MdClose />
            </button>

            <button
              onClick={() =>
                setAcceptConfirmationPopup({
                  show: true,
                  gallery_id,
                  name,
                  email,
                })
              }
              className="disabled:cursor-not-allowed disabled:bg-dark/10 flex gap-x-2 w-fit rounded-md items-center  h-[40px] px-4 bg-green-600 text-white"
            >
              <span className="text-[14px] ">Accept Gallery</span>

              <IoCheckmarkOutline />
            </button>
          </div>
        )}
      </div>
      <hr className="border-dark/10 mt-5" />
    </div>
  );
}
