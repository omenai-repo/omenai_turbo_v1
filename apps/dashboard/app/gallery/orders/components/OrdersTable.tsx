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
import { CgTrack } from "react-icons/cg";
import { RiProgress2Line } from "react-icons/ri";

import {
  CreateOrderModelTypes,
  AddressTypes,
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
          order.buyer_details.name.toLowerCase().startsWith(searchValue)
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
    shipping_address: AddressTypes,
    order_id: string,
    status: "completed" | "processing",
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
      status === "processing" &&
      order_accepted === "accepted" &&
      payment_status === "pending" &&
      tracking_status === ""
    ) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 flex gap-x-1 items-center w-fit">
          <MdInfo />
          Awaiting payment
        </span>
      );
    }
    if (
      status === "processing" &&
      order_accepted === "accepted" &&
      payment_status === "completed" &&
      tracking_status === ""
    ) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 flex gap-x-1 items-center w-fit">
          <GoIssueClosed />
          Payment completed
        </span>
      );
    }
    if (
      status === "processing" &&
      order_accepted === "accepted" &&
      payment_status === "completed" &&
      tracking_status !== ""
    ) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 flex gap-x-1 items-center w-fit">
          <RiProgress2Line />
          Delivery in progress
        </span>
      );
    }
    if (
      status === "processing" &&
      order_accepted === "" &&
      payment_status === "pending" &&
      tracking_status === ""
    ) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 flex gap-x-1 items-center w-fit">
          <MdInfo />
          Action required
        </span>
      );
    }
    if (status === "completed" && order_accepted === "declined") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-200 flex gap-x-1 items-center w-fit">
          <IoClose />
          Order declined by Gallery
        </span>
      );
    }
    if (status === "completed" && order_accepted === "accepted") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 flex gap-x-1 items-center w-fit">
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
          className="w-[500px] focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[40px] p-6 rounded-full placeholder:text-dark/40 placeholder:text-xs"
          placeholder="Search by order ID, artwork name or buyer name"
          onChange={handleSearchChange}
        />
        <RiSearch2Line className="absolute right-5 top-4 text-[#858585]" />
      </div>
      <table className=" w-full table-auto border-separate border-spacing-y-2 overflow-scroll text-left md:overflow-auto">
        <thead className="w-full rounded-full h-[40px] bg-[#EFEFEF] text-base font-semibold text-white">
          <tr className="px-1 rounded-full">
            <th className="whitespace-nowrap  py-3 pl-3 text-[14px] font-medium text-dark">
              Order ID
            </th>
            <th className="whitespace-nowrap py-3 pl-1 text-[14px] font-medium text-dark">
              Artwork name
            </th>
            <th className="whitespace-nowrap py-3 text-[14px] font-medium text-dark">
              Order Date
            </th>
            <th className="whitespace-nowrap px-2.5 py-3 text-[14px] font-medium text-dark">
              Status
            </th>
            {tab === "completed" && (
              <th className="whitespace-nowrap rounded-r-lg py-3 pl-1 text-[14px] font-medium text-dark">
                Order completion date
              </th>
            )}
            <th className="whitespace-nowrap rounded-r-lg py-3 pl-1 text-[14px] font-medium text-dark">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order: CreateOrderModelTypes) => {
            return (
              <tr
                key={order.order_id}
                className="cursor-pointer bg-white ring-1 ring-[#EFEFEF] duration-200 my-2"
              >
                <td className=" py-4 pl-3 text-[14px] font-normal text-dark">
                  {order.order_id}
                </td>
                <td className="px-1 py-4 text-[14px] font-normal text-dark">
                  {order.artwork_data.title}
                </td>
                <td className="px-1 py-4 text-[14px] font-normal text-dark">
                  {formatIntlDateTime(order.createdAt)}
                </td>
                {/* <td className="px-1 py-4 text-[14px] font-medium text-dark">
                  {formatPrice(order.artwork_data.pricing.usd_price)}
                </td> */}
                <td className="px-2.5 py-4 text-[14px] font-normal text-dark">
                  {construct_status(
                    order.status,
                    order.payment_information.status,
                    order.shipping_details.shipment_information.tracking.link,
                    order.order_accepted.status
                  )}
                </td>
                {order.status === "completed" && (
                  <td className="px-1 py-4 text-[14px] font-medium text-dark">
                    {formatIntlDateTime(order.updatedAt)}
                  </td>
                )}
                <td className="rounded-r-[8px] px-1 py-4 text-[14px] font-medium text-dark">
                  {order.payment_information.status === "pending" &&
                    order.status !== "completed" &&
                    order.order_accepted.status === "accepted" && (
                      <button
                        disabled
                        className=" h-[40px] p-6 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-[14px] font-normal"
                      >
                        <span>No action required</span>
                      </button>
                    )}
                  {order.payment_information.status === "completed" &&
                    order.order_accepted.status === "accepted" &&
                    order.status !== "completed" &&
                    order.shipping_details.shipment_information.tracking
                      .link !== "" && (
                      <button
                        disabled
                        className=" h-[40px] p-6 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-[14px] font-normal"
                      >
                        <span>No action required</span>
                      </button>
                    )}
                  {order.payment_information.status === "completed" &&
                    order.order_accepted.status === "accepted" &&
                    order.shipping_details.shipment_information.tracking
                      .link === "" && (
                      <div className="relative flex items-center gap-x-1">
                        <button
                          onClick={() =>
                            handleUploadTrackingInformationRequest(
                              order.order_id
                            )
                          }
                          className=" h-[40px] p-6 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-[14px] font-normal"
                        >
                          <CgTrack />
                          <span>Upload tracking information</span>
                        </button>
                      </div>
                    )}

                  {order.order_accepted.status === "" && (
                    <div className="relative flex items-center gap-x-1">
                      <button
                        onClick={() =>
                          handleViewOrder(
                            order.buyer_details.name,
                            order.shipping_details.addresses.destination,
                            order.order_id,
                            order.status,
                            order.artwork_data
                          )
                        }
                        className=" h-[40px] p-6 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-[14px] font-normal"
                      >
                        <MdOutlineCallToAction />
                        <span>Take action</span>
                      </button>
                    </div>
                  )}
                  {order.status === "completed" && (
                    <div className="relative flex items-center gap-x-1">
                      <button
                        onClick={() =>
                          handleViewOrder(
                            order.buyer_details.name,
                            order.shipping_details.addresses.destination,
                            order.order_id,
                            order.status,
                            order.artwork_data
                          )
                        }
                        className=" h-[40px] p-6 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-[14px] font-normal"
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
