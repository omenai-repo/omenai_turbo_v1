"use client";
import React, { ChangeEvent, FormEvent, useState } from "react";

import { currencies } from "@omenai/shared-json/src/currency_select";

import { toast } from "sonner";

import { updateArtworkPrice } from "@omenai/shared-services/artworks/updateArtworkPrice";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { deleteArtwork } from "@omenai/shared-services/artworks/deleteArtwork";
import { getCurrencyConversion } from "@omenai/shared-services/exchange_rate/getCurrencyConversion";
import {
  ArtworkSchemaTypes,
  ArtworkPriceFilterData,
} from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { getCurrencySymbol } from "@omenai/shared-utils/src/getCurrencySymbol";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function EditArtworkWrapper({
  artwork,
}: {
  artwork: ArtworkSchemaTypes & { createdAt: string; updatedAt: string };
}) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [data, setData] = useState({
    price: "",
    currency: "",
    usd_price: "",
    shouldShowPrice: "",
  });

  const { csrf, user } = useAuth({ requiredRole: "gallery" });

  console.log(user.subscription_status);
  const handleChange = async (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "currency") {
      setData((prevData) => ({
        ...prevData,
        price: "",
        usd_price: "",
      }));
    }

    if (name === "price") {
      const conversion_value = await getCurrencyConversion(
        data.currency.toUpperCase(),
        +value,
        csrf || ""
      );

      if (!conversion_value?.isOk)
        toast.error("Error notification", {
          description: "Unable to retrieve exchange rate value at this time.",
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
      else {
        setData((prevData) => ({
          ...prevData,
          usd_price: conversion_value.data.toString(),
        }));
      }
    }
  };

  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    if (Object.values(data).some((value) => value === "")) {
      setLoading(false);
      toast.error("Error notification", {
        description: "Invalid field inputs",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    } else {
      const filter: ArtworkPriceFilterData = {
        "pricing.price": +data.price,
        "pricing.usd_price": +data.usd_price,
        "pricing.shouldShowPrice": data.shouldShowPrice,
        "pricing.currency": data.currency,
      };

      const update = await updateArtworkPrice(
        filter,
        artwork.art_id,
        csrf || ""
      );

      if (!update?.isOk)
        toast.error("Error notification", {
          description: update?.message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
      else {
        toast.success("Operation successful", {
          description: update.message,
          style: {
            background: "green",
            color: "white",
          },
          className: "class",
        });
        queryClient.invalidateQueries({ queryKey: ["fetch_artworks_by_id"] });
        router.replace("/gallery/artworks");
      }
      setLoading(false);
    }
  }

  async function deleteUploadArtwork() {
    setDeleteLoading(true);
    const deleteArtworkData = await deleteArtwork(artwork.art_id, csrf || "");

    if (!deleteArtworkData?.isOk)
      toast.error("Error notification", {
        description: deleteArtworkData?.message,
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    else {
      toast.success("Operation successful", {
        description: deleteArtworkData.message,
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });
      queryClient.invalidateQueries({
        queryKey: ["fetch_artworks_by_id"],
      });
      router.replace("/gallery/artworks");
    }
    setDeleteLoading(false);
  }

  const currency_symbol = getCurrencySymbol(data.currency);
  const usd_symbol = getCurrencySymbol("USD");

  return (
    <div className="mt-5">
      <div className="w-full py-3 bg-white">
        <h1 className="text-fluid-base font-semibold text-dark">
          Update artwork pricing
        </h1>
      </div>

      <div className="grid lg:grid-cols-2 mt-2 gap-5 items-center justify-center">
        <form className="w-full flex flex-col gap-y-4" onSubmit={handleSubmit}>
          <div className=" flex flex-col w-full">
            <div className="flex flex-col gap-1">
              <label
                htmlFor={"currency"}
                className="text-dark font-normal text-fluid-xs"
              >
                Currency
              </label>
              <select
                onChange={handleChange}
                name="currency"
                required={true}
                className="border-0 ring-1 ring-dark/20 focus:ring text-fluid-xs focus:ring-dark px-6 py-2 sm:py-3 rounded "
              >
                <option value="">Select</option>
                <>
                  {currencies!.map((item, index) => {
                    return (
                      <option
                        key={item.code}
                        value={item.code}
                        className="px-3 py-5 my-5 font-normal text-fluid-xs text-dark"
                      >
                        {item.name}
                      </option>
                    );
                  })}
                </>
              </select>
            </div>
          </div>
          <div className="flex flex-col space-y-1 items-center">
            <div className="flex flex-col w-full">
              <label
                htmlFor={"price"}
                className="text-dark font-normal text-fluid-xs"
              >
                Price
              </label>
              <input
                name="price"
                type="string"
                value={data.price}
                required={true}
                disabled={data.currency === ""}
                placeholder={"Enter price in your preferred currency"}
                onChange={handleChange}
                className="w-full focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out h-[35px] p-5 rounded placeholder:text-dark/40 placeholder:text-fluid-xs"
              />
            </div>

            <div className="w-full text-fluid-xs my-4">
              {data.currency !== "" &&
                data.price !== "" &&
                data.usd_price !== "" && (
                  <span className=" text-dark font-normal">
                    Exchange rate:{" "}
                    {`${formatPrice(
                      +data.price,
                      currency_symbol
                    )} = ${formatPrice(+data.usd_price, usd_symbol)}`}
                  </span>
                )}

              <p className="font-semibold text-fluid-xs mt-1 text-red-600">
                Please note: To ensure consistent pricing across the platform,
                all uploaded prices will be displayed in US Dollar equivalents.
              </p>
            </div>
          </div>
          {/* Should show price */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor={"shouldShowPrice"}
              className="text-dark font-normal text-fluid-xs"
            >
              Display price value
            </label>
            <select
              onChange={handleChange}
              name="shouldShowPrice"
              required={true}
              disabled={
                user.subscription_status.type === null ||
                ["basic", "pro"].includes(
                  user.subscription_status.type.toLowerCase()
                )
              }
              className="border-0 ring-1 ring-dark/20 focus:ring text-fluid-xs disabled:cursor-not-allowed focus:ring-dark px-6 py-2 sm:py-3 rounded "
            >
              <option
                value={
                  user.subscription_status.type !== null &&
                  ["basic", "pro"].includes(
                    user.subscription_status.type.toLowerCase()
                  )
                    ? "Yes"
                    : ""
                }
              >
                {user.subscription_status.type !== null &&
                ["basic", "pro"].includes(
                  user.subscription_status.type.toLowerCase()
                )
                  ? "Yes"
                  : "Select"}
              </option>
              <option
                value="Yes"
                className="px-3 py-5 my-5 font-normal text-fluid-xs text-dark"
              >
                Yes
              </option>
              <option
                value="No"
                className="px-3 py-5 my-5 font-normal text-fluid-xs text-dark"
              >
                No
              </option>
            </select>
          </div>

          <div className="w-full mt-5">
            <button
              disabled={loading}
              type="submit"
              className="h-[35px] p-5 rounded w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal"
            >
              {loading ? <LoadSmall /> : " Update pricing details"}
            </button>
          </div>

          <div className="w-full">
            <button
              onClick={deleteUploadArtwork}
              disabled={deleteLoading}
              type="button"
              className="h-[35px] p-5 rounded w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-red-600 hover:bg-red-500 text-white text-fluid-xs font-normal"
            >
              {deleteLoading ? <LoadSmall /> : " Delete ths artwork"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
