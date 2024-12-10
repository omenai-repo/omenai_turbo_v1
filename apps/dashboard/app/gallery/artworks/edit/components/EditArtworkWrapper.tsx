"use client";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";

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
        +value
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

      const update = await updateArtworkPrice(filter, artwork.art_id);

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
    const deleteArtworkData = await deleteArtwork(artwork.art_id);

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
        <h1 className="text-base text-dark font-normal">
          Update artwork pricing
        </h1>
      </div>

      <div className="grid lg:grid-cols-2 mt-2 gap-5 items-center justify-center">
        <form className="w-full flex flex-col gap-y-4" onSubmit={handleSubmit}>
          <div className=" flex flex-col w-full">
            <div className="flex flex-col gap-1">
              <label
                htmlFor={"currency"}
                className="text-dark/80 font-normal text-xs"
              >
                Currency
              </label>
              <select
                onChange={handleChange}
                name="currency"
                required={true}
                className="border px-2 ring-0 text-[14px] text-dark border-[#E0E0E0] w-full py-2 focus:border-none focus:ring-dark placeholder:font-light placeholder:text-xs placeholder:text-[#858585] "
              >
                <option value="">Select</option>
                <>
                  {currencies!.map((item, index) => {
                    return (
                      <option
                        key={item.code}
                        value={item.code}
                        className="px-3 py-5 my-5 font-normal text-[14px] text-dark"
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
                className="text-[#858585] font-normal text-xs"
              >
                Price (Enter price in your preferred currency)
              </label>
              <input
                name="price"
                type="string"
                value={data.price}
                required={true}
                disabled={data.currency === ""}
                placeholder={"Enter price in your preferred currency"}
                onChange={handleChange}
                className="border px-2 ring-0 text-xs text-[#858585] disabled:cursor-not-allowed disabled:bg-[#E0E0E0] border-[#E0E0E0] w-full py-2 focus:border-none focus:ring-dark placeholder:font-light placeholder:text-xs placeholder:text-[#858585] "
              />
            </div>

            <div className="w-full text-[14px] my-4">
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

              <p className="font-semibold text-[14px] mt-1 text-red-600">
                Please note: To ensure consistent pricing across the platform,
                all uploaded prices will be displayed in US Dollar equivalents.
              </p>
            </div>
          </div>
          {/* Should show price */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor={"shouldShowPrice"}
              className="text-dark/80 font-normal text-xs"
            >
              Display price value
            </label>
            <select
              onChange={handleChange}
              name="shouldShowPrice"
              required={true}
              className="border px-2 ring-0 text-[14px] text-dark border-[#E0E0E0] w-full py-2 focus:border-none focus:ring-dark placeholder:font-light placeholder:text-xs placeholder:text-[#858585] "
            >
              <option value="">Select</option>
              <option
                value="Yes"
                className="px-3 py-5 my-5 font-normal text-[14px] text-dark"
              >
                Yes
              </option>
              <option
                value="No"
                className="px-3 py-5 my-5 font-normal text-[14px] text-dark"
              >
                No
              </option>
            </select>
          </div>

          <div className="w-full mt-5">
            <button
              disabled={loading}
              type="submit"
              className="h-[40px] px-4 w-full text-white disabled:cursor-not-allowed disabled:bg-[#E0E0E0] hover:bg-dark/80 text-xs bg-dark duration-200 grid place-items-center"
            >
              {loading ? <LoadSmall /> : " Update pricing details"}
            </button>
          </div>

          <div className="w-full">
            <button
              onClick={deleteUploadArtwork}
              disabled={deleteLoading}
              type="button"
              className="h-[40px] px-4 w-full text-white disabled:cursor-not-allowed disabled:bg-[#E0E0E0] hover:bg-red-600/80 text-xs bg-red-600 duration-200 grid place-items-center"
            >
              {deleteLoading ? <LoadSmall /> : " Delete ths artwork"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
