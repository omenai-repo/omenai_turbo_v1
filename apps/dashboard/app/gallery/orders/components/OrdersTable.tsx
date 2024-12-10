"use client";

import { MdOutlineCallToAction } from "react-icons/md";
import { ObjectId } from "mongoose";
import { IoClose } from "react-icons/io5";
import { MdInfo } from "react-icons/md";
import { GoIssueClosed } from "react-icons/go";
import { VscEye } from "react-icons/vsc";
import { ChangeEvent, useState } from "react";
import { RiSearch2Line } from "react-icons/ri";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import {
  CreateOrderModelTypes,
  IndividualAddressTypes,
  ArtworkSchemaTypes,
} from "@omenai/shared-types";
import { formatIntlDateTime } from "@omenai/shared-utils/src/formatIntlDateTime";

type OrdersTableProps = {
  data: CreateOrderModelTypes[] & {
    createdAt: string;
    updatedAt: string;
    _id: ObjectId;
  };
  tab?: "completed";
};

export default function OrdersTable({ data, tab }: OrdersTableProps) {
  const [orders, setOrders] = useState<
    | (CreateOrderModelTypes[] & {
        createdAt: string;
        updatedAt: string;
        _id: ObjectId;
      })
    | []
  >(data);

  function handleSearchChange(e: ChangeEvent<HTMLInputElement>) {
    const searchValue = e.target.value.toLowerCase();

    // Update state using setState
    if (searchValue === "" || null) {
      setOrders(data);
    }
    setOrders(() => {
      const searchFilter = data.filter(
        (order) =>
          order.order_id.toLowerCase().startsWith(searchValue) ||
          order.artwork_data.title.toLowerCase().startsWith(searchValue) ||
          order.buyer.name.toLowerCase().startsWith(searchValue)
      );

      return [...searchFilter] as CreateOrderModelTypes[] & {
        createdAt: string;
        updatedAt: string;
        _id: ObjectId;
      };
    });
  }
  const {
    updateGalleryOrderActionModalData,
    toggleGalleryOrderActionModal,
    toggleUploadTrackingInfoModal,
    update_current_order_id,
  } = actionStore();

  function handleViewOrder(
    buyer: string,
    shipping_address: IndividualAddressTypes,
    order_id: string,
    status: "completed" | "pending",
    artwork: Pick<ArtworkSchemaTypes, "pricing" | "title" | "url" | "artist">
  ) {
    updateGalleryOrderActionModalData(
      buyer,
      shipping_address!,
      order_id,
      status,
      artwork
    );
    toggleGalleryOrderActionModal(true);
  }

  function handleUploadTrackingInformationRequest(order_id: string) {
    update_current_order_id(order_id);
    toggleUploadTrackingInfoModal(true);
  }

  function construct_status(
    status: string,
    payment_status: string,
    tracking_status: string,
    order_accepted: string
  ) {
    if (
      status === "pending" &&
      status === "pending" &&
      order_accepted === "accepted" &&
      payment_status === "pending" &&
      tracking_status === ""
    ) {
      return (
        <span className="px-3 py-1 rounded-full bg-amber-100 flex gap-x-1 items-center w-fit">
          <MdInfo />
          Awaiting payment
        </span>
      );
    }
    if (
      status === "pending" &&
      status === "pending" &&
      order_accepted === "accepted" &&
      payment_status === "completed" &&
      tracking_status === ""
    ) {
      return (
        <span className="px-3 py-1 rounded-full bg-green-100 flex gap-x-1 items-center w-fit">
          <GoIssueClosed />
          Payment completed
        </span>
      );
    }
    if (
      status === "pending" &&
      order_accepted === "accepted" &&
      payment_status === "completed" &&
      tracking_status !== ""
    ) {
      return (
        <span className="px-3 py-1 rounded-full bg-green-100 flex gap-x-1 items-center w-fit">
          <GoIssueClosed />
          Delivery in progress
        </span>
      );
    }
    if (
      status === "pending" &&
      order_accepted === "" &&
      payment_status === "pending" &&
      tracking_status === ""
    ) {
      return (
        <span className="px-3 py-1 rounded-full bg-amber-100 flex gap-x-1 items-center w-fit">
          <MdInfo />
          Action required
        </span>
      );
    }
    if (status === "completed" && order_accepted === "declined") {
      return (
        <span className="px-3 py-1 rounded-full bg-red-200 flex gap-x-1 items-center w-fit">
          <IoClose />
          Order declined by Gallery
        </span>
      );
    }
    if (status === "completed" && order_accepted === "accepted") {
      return (
        <span className="px-3 py-1 rounded-full bg-green-100 flex gap-x-1 items-center w-fit">
          <GoIssueClosed />
          Order has been completed
        </span>
      );
    }
  }

  return (
    <div className="mt-5 overflow-hidden">
      <div className="mt-1 mb-8 w-fit h-fit relative pl-1">
        <input
          type="text"
          className="h-[40px] px-4 pl-10 w-[500px] border border-[#E0E0E0] text-xs placeholder:text-[#858585] placeholder:text-xs bg-transparent focus:border-none focus:ring-1 focus:ring-dark/80 duration-300 focus:outline-none"
          placeholder="Search by order ID, artwork name or buyer name"
          onChange={handleSearchChange}
        />
        <RiSearch2Line className="absolute left-5 top-4 text-[#858585]" />
      </div>
      <table className=" w-full table-auto border-separate border-spacing-y-2 overflow-scroll text-left md:overflow-auto">
        <thead className="w-full rounded-lg bg-[#EFEFEF] text-base font-semibold text-white">
          <tr className="px-1">
            <th className="whitespace-nowrap  py-3 pl-3 text-xs font-normal text-dark">
              Order ID
            </th>
            <th className="whitespace-nowrap py-3 pl-1 text-xs font-normal text-dark">
              Artwork name
            </th>
            <th className="whitespace-nowrap py-3 text-xs font-normal text-dark">
              Order Date
            </th>
            <th className="whitespace-nowrap px-2.5 py-3 text-xs font-normal text-dark">
              Status
            </th>
            {tab === "completed" && (
              <th className="whitespace-nowrap rounded-r-lg py-3 pl-1 text-xs font-normal text-dark">
                Order completion date
              </th>
            )}
            <th className="whitespace-nowrap rounded-r-lg py-3 pl-1 text-xs font-normal text-dark">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((artwork: any, index: number) => {
            return (
              <tr
                key={artwork.order_id}
                className="cursor-pointer bg-white ring-1 ring-[#EFEFEF] duration-200 my-2"
              >
                <td className=" py-4 pl-3 text-xs font-normal text-dark">
                  {artwork.order_id}
                </td>
                <td className="px-1 py-4 text-xs font-normal text-dark">
                  {artwork.artwork_data.title}
                </td>
                <td className="px-1 py-4 text-xs font-normal text-dark">
                  {formatIntlDateTime(artwork.createdAt)}
                </td>
                {/* <td className="px-1 py-4 text-xs font-normal text-dark">
                  {formatPrice(artwork.artwork_data.pricing.usd_price)}
                </td> */}
                <td className="px-2.5 py-4 text-xs font-normal text-dark">
                  {construct_status(
                    artwork.status,
                    artwork.payment_information.status,
                    artwork.tracking_information.tracking_link,
                    artwork.order_accepted.status
                  )}
                </td>
                {artwork.status === "completed" && (
                  <td className="px-1 py-4 text-xs font-normal text-dark">
                    {formatIntlDateTime(artwork.updatedAt)}
                  </td>
                )}
                <td className="rounded-r-[8px] px-1 py-4 text-xs font-normal text-dark">
                  {artwork.payment_information.status === "pending" &&
                    artwork.status !== "completed" &&
                    artwork.order_accepted.status === "accepted" && (
                      <button
                        disabled
                        className=" bg-dark rounded-sm disabled:bg-[#E0E0E0] text-[#858585] disabled:cursor-not-allowed h-[40px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark/80"
                      >
                        <span>No action required</span>
                      </button>
                    )}
                  {artwork.payment_information.status === "completed" &&
                    artwork.order_accepted.status === "accepted" &&
                    artwork.status !== "completed" &&
                    artwork.tracking_information.tracking_link !== "" && (
                      <button
                        disabled
                        className=" bg-dark disabled:bg-[#E0E0E0] rounded-sm text-[#858585] disabled:cursor-not-allowed h-[40px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark/80"
                      >
                        <span>No action required</span>
                      </button>
                    )}
                  {artwork.payment_information.status === "completed" &&
                    artwork.order_accepted.status === "accepted" &&
                    artwork.tracking_information.tracking_link === "" && (
                      <div className="relative flex items-center gap-x-1">
                        <button
                          onClick={() =>
                            handleUploadTrackingInformationRequest(
                              artwork.order_id
                            )
                          }
                          className=" bg-dark rounded-sm text-white h-[40px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark/80"
                        >
                          <MdOutlineCallToAction />
                          <span>Upload tracking information</span>
                        </button>
                      </div>
                    )}

                  {artwork.order_accepted.status === "" && (
                    <div className="relative flex items-center gap-x-1">
                      <button
                        onClick={() =>
                          handleViewOrder(
                            artwork.buyer.name,
                            artwork.shipping_address,
                            artwork.order_id,
                            artwork.status,
                            artwork.artwork_data
                          )
                        }
                        className=" bg-dark rounded-sm text-white h-[40px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark/80"
                      >
                        <MdOutlineCallToAction />
                        <span>Take action</span>
                      </button>
                    </div>
                  )}
                  {artwork.status === "completed" && (
                    <div className="relative flex items-center gap-x-1">
                      <button
                        onClick={() =>
                          handleViewOrder(
                            artwork.buyer.name,
                            artwork.shipping_address,
                            artwork.order_id,
                            artwork.status,
                            artwork.artwork_data
                          )
                        }
                        className=" bg-dark rounded-sm text-white h-[40px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark/80"
                      >
                        <VscEye />
                        <span>View</span>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
