"use client";

import { storage } from "@omenai/appwrite-config";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { uploadArtworkData } from "@omenai/shared-services/artworks/uploadArtworkData";
import uploadImage from "@omenai/shared-services/artworks/uploadArtworkImage";
import { getCurrencyConversion } from "@omenai/shared-services/exchange_rate/getCurrencyConversion";
import { artistArtworkUploadStore } from "@omenai/shared-state-store/src/artist/artwork_upload/artistArtworkUpload";
import { createUploadedArtworkData } from "@omenai/shared-utils/src/createUploadedArtworkData";
import {
  getImageAspectRatio,
  getRatioString,
} from "@omenai/shared-utils/src/getImageAspectRatio";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useRollbar } from "@rollbar/react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import AgreementsSection from "./components/AgreementSection";
import { BUTTON_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";

interface Currency {
  name: string;
  code: string;
  symbol: string;
}

interface ConversionResult {
  formatted: string;
  rate: number;
  label: string;
}

const getCountryCode = (currencyCode: string): string => {
  const mapping: Record<string, string> = {
    USD: "us",
    EUR: "eu",
    GBP: "gb",
    CAD: "ca",
    AUD: "au",
    JPY: "jp",
    CHF: "ch",
    CNY: "cn",
    INR: "in",
    NGN: "ng",
    KES: "ke",
    GHS: "gh",
    ZAR: "za",
    EGP: "eg",
    MAD: "ma",
    TZS: "tz",
    UGX: "ug",
    XOF: "sn",
    BRL: "br",
    MXN: "mx",
    ARS: "ar",
    COP: "co",
    SGD: "sg",
    HKD: "hk",
    KRW: "kr",
    AED: "ae",
    SAR: "sa",
    TRY: "tr",
    SEK: "se",
    NOK: "no",
  };
  return mapping[currencyCode] || "un";
};

// Emojis removed, as we are now using FlagCDN
const CURRENCIES: Currency[] = [
  { name: "US Dollar ($)", code: "USD", symbol: "$" },
  { name: "Euro (€)", code: "EUR", symbol: "€" },
  { name: "British Pound (£)", code: "GBP", symbol: "£" },
  { name: "Canadian Dollar (C$)", code: "CAD", symbol: "C$" },
  { name: "Australian Dollar (A$)", code: "AUD", symbol: "A$" },
  { name: "Japanese Yen (¥)", code: "JPY", symbol: "¥" },
  { name: "Swiss Franc (Fr)", code: "CHF", symbol: "Fr" },
  { name: "Chinese Yuan (¥)", code: "CNY", symbol: "¥" },
  { name: "Indian Rupee (₹)", code: "INR", symbol: "₹" },
  { name: "Nigerian Naira (₦)", code: "NGN", symbol: "₦" },
  { name: "Kenyan Shilling (Ksh)", code: "KES", symbol: "Ksh" },
  { name: "Ghanaian Cedi (₵)", code: "GHS", symbol: "₵" },
  { name: "South African Rand (R)", code: "ZAR", symbol: "R" },
  { name: "Egyptian Pound (E£)", code: "EGP", symbol: "E£" },
  { name: "Moroccan Dirham (MAD)", code: "MAD", symbol: "MAD" },
  {
    name: "Tanzanian Shilling (TSh)",
    code: "TZS",
    symbol: "TSh",
  },
  { name: "Ugandan Shilling (USh)", code: "UGX", symbol: "USh" },
  { name: "West African CFA (CFA)", code: "XOF", symbol: "CFA" },
  { name: "Brazilian Real (R$)", code: "BRL", symbol: "R$" },
  { name: "Mexican Peso (Mex$)", code: "MXN", symbol: "Mex$" },
  { name: "Argentine Peso ($)", code: "ARS", symbol: "$" },
  { name: "Colombian Peso ($)", code: "COP", symbol: "$" },
  { name: "Singapore Dollar (S$)", code: "SGD", symbol: "S$" },
  { name: "Hong Kong Dollar (HK$)", code: "HKD", symbol: "HK$" },
  { name: "South Korean Won (₩)", code: "KRW", symbol: "₩" },
  { name: "UAE Dirham (د.إ)", code: "AED", symbol: "د.إ" },
  { name: "Saudi Riyal (﷼)", code: "SAR", symbol: "﷼" },
  { name: "Turkish Lira (₺)", code: "TRY", symbol: "₺" },
  { name: "Swedish Krona (kr)", code: "SEK", symbol: "kr" },
  { name: "Norwegian Krone (kr)", code: "NOK", symbol: "kr" },
];

const CurrencySetupPanel = ({
  activeCurrency,
  setActiveCurrency,
  priceValue,
  setPriceValue,
  handleConvert,
  converting,
  setUsdPrice,
  rate,
}: any) => {
  const [pickerOpen, setPickerOpen] = useState(true);
  const [search, setSearch] = useState("");

  const filteredCurrencies = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return CURRENCIES;
    return CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm rounded-xl p-6 flex flex-col h-full">
      <h2 className="text-xs tracking-widest uppercase text-neutral-400 dark:text-neutral-500 font-semibold mb-4">
        1. Base Price & Currency
      </h2>

      {/* Selected Currency Dropdown Trigger */}
      <button
        onClick={() => setPickerOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/50 rounded-xl mb-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* FlagCDN Image Injection */}
          <div className="w-8 h-6 overflow-hidden rounded-sm shadow-sm flex-shrink-0 bg-neutral-200 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <img
              src={`https://flagcdn.com/w40/${getCountryCode(activeCurrency.code)}.png`}
              srcSet={`https://flagcdn.com/w80/${getCountryCode(activeCurrency.code)}.png 2x`}
              width="32"
              alt={`${activeCurrency.name} flag`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-left font-semibold text-neutral-900 dark:text-neutral-100">
            {activeCurrency.name}
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-neutral-400 transition-transform duration-300 ${pickerOpen ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Picker Panel */}
      {pickerOpen && (
        <div className="mb-6 flex-1 flex flex-col min-h-0">
          <div className="relative mb-3">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search currencies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-2.5 pl-9 pr-4 text-sm bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto overscroll-contain touch-pan-y max-h-[260px] pr-1 custom-scrollbar">
            {filteredCurrencies.length === 0 ? (
              <p className="col-span-full text-sm text-neutral-400 text-center py-6">
                No currencies found
              </p>
            ) : (
              filteredCurrencies.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setActiveCurrency(c);
                    setUsdPrice("");
                  }}
                  className={`flex items-center text-left gap-3 py-2.5 px-3 rounded-xl border text-sm transition-all duration-200
                    ${
                      activeCurrency.code === c.code
                        ? "bg-violet-50 border-violet-200 text-violet-900 dark:bg-violet-900/30 dark:border-violet-700/50 dark:text-violet-100 shadow-sm"
                        : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                    }`}
                >
                  {/* FlagCDN Image Injection for List Items */}
                  <div className="w-6 h-4.5 overflow-hidden rounded-[2px] shadow-sm flex-shrink-0 bg-neutral-200 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/50">
                    <img
                      src={`https://flagcdn.com/w40/${getCountryCode(c.code)}.png`}
                      width="24"
                      alt={`${c.name} flag`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <span className="font-medium truncate">{c.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Price Input & Convert Button */}
      <div className="mt-auto pt-6 border-t border-neutral-100 dark:border-neutral-800">
        <label className="text-xs tracking-widest uppercase text-neutral-400 dark:text-neutral-500 font-semibold mb-3 block">
          Price Input
        </label>
        <div className="flex items-center border border-neutral-200 dark:border-neutral-700/80 rounded-xl overflow-hidden mb-4 bg-white dark:bg-neutral-950 focus-within:ring-2 focus-within:ring-dark/20 focus-within:border-dark transition-all ">
          <span className="px-4 h-14 flex items-center justify-center text-lg font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
            {activeCurrency.symbol}
          </span>
          <input
            type="number"
            min="0"
            placeholder="0.00"
            value={priceValue}
            onChange={(e) => {
              setPriceValue(e.target.value);
              setUsdPrice("");
            }}
            className="flex-1 h-14 px-4 text-2xl font-light bg-transparent border-transparent ring-transparent focus:ring-0 focus:border-0 text-neutral-900 dark:text-neutral-100 outline-none placeholder-neutral-300 dark:placeholder-neutral-700"
          />
        </div>

        <button
          onClick={handleConvert}
          disabled={converting || !priceValue}
          className="w-full h-12 flex items-center justify-center gap-2 bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-white text-white dark:text-neutral-900 text-sm font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
        >
          {converting ? (
            <svg
              className="w-5 h-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                className="opacity-25"
              />
              <path
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                className="opacity-75"
              />
            </svg>
          ) : (
            "Convert to USD"
          )}
        </button>
      </div>
    </div>
  );
};

const ConversionDisplay = ({ result, activeCurrency, rate }: any) => (
  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm rounded-xl p-6">
    <h2 className="text-xs tracking-widest uppercase text-neutral-400 dark:text-neutral-500 font-semibold mb-4">
      2. Converted Global Value
    </h2>
    <div className="text-5xl font-light text-neutral-900 dark:text-neutral-100 tracking-tight mb-2">
      {result ? `$${result.formatted}` : "—"}
    </div>
    <div className="text-sm text-neutral-500 dark:text-neutral-400">
      {result
        ? activeCurrency.code === "USD"
          ? "Base currency is USD — no conversion needed"
          : `Based on current parity: 1 ${activeCurrency.code} = $${rate} USD`
        : "Enter a base price and convert to see global value"}
    </div>
    {result && activeCurrency.code !== "USD" && (
      <div className="mt-4 inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-semibold px-3 py-1.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        {result.label}
      </div>
    )}
  </div>
);

const VisibilityToggle = ({ displayPrice, setDisplayPrice }: any) => (
  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm rounded-xl p-6 flex items-center justify-between gap-4">
    <div>
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        Public Price Visibility
      </h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
        {displayPrice
          ? "Price is currently visible to all platform collectors."
          : "Pricing is hidden. Collectors must request a quote."}
      </p>
    </div>
    <button
      role="switch"
      aria-checked={displayPrice}
      onClick={() => setDisplayPrice((v: boolean) => !v)}
      className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900
        ${displayPrice ? "bg-green-500" : "bg-neutral-200 dark:bg-neutral-700"}`}
    >
      <span className="sr-only">Toggle public price visibility</span>
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-300 ease-in-out
          ${displayPrice ? "translate-x-6" : "translate-x-0"}`}
      />
    </button>
  </div>
);

export default function PriceSetup() {
  const { user, csrf } = useAuth({ requiredRole: "artist" });
  const { artworkUploadData, clearData, image, setImage } =
    artistArtworkUploadStore();
  const rollbar = useRollbar();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeCurrency, setActiveCurrency] = useState<Currency>(CURRENCIES[0]);
  const [priceValue, setPriceValue] = useState("");
  const [usdPrice, setUsdPrice] = useState<string>("");
  const [conversionRate, setConversionRate] = useState<number | null>(null);
  const [converting, setConverting] = useState(false);
  const [displayPrice, setDisplayPrice] = useState(true);
  const [loading, setLoading] = useState(false);
  const [acknowledgment, setAcknowledgment] = useState(false);
  const [penaltyConsent, setPenaltyConsent] = useState(false);
  const [priceConsent, setPriceConsent] = useState(false);
  const canProceed = acknowledgment && penaltyConsent && priceConsent;

  const currentStep =
    (priceConsent ? 1 : 0) +
    (acknowledgment ? 1 : 0) +
    (penaltyConsent ? 1 : 0);

  const canUpload = canProceed && !loading && image && priceValue && usdPrice;

  const handleCurrencyConversion = async () => {
    const value = Number(priceValue) > 0 ? priceValue.toString() : "";
    setConverting(true);
    try {
      const conversion_value = await getCurrencyConversion(
        activeCurrency.code.toUpperCase(),
        +value,
        csrf || "",
      );

      if (!conversion_value?.isOk)
        toast_notif(
          "Issue encountered while retrieving exchange rate value. Please try again.",
          "error",
        );
      else {
        const rounded_conversion_value =
          Math.round(+conversion_value.data * 10) / 10;
        setUsdPrice(rounded_conversion_value.toString());
        setConversionRate(conversion_value.rate);
      }
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
      toast_notif(
        "An error occurred while converting the currency. Please try again.",
        "error",
      );
      return;
    } finally {
      setConverting(false);
    }
  };

  const handleArtworkUpload = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();

    if (!image) {
      toast_notif("Please select an image to proceed", "error");
      return;
    }

    if (!canProceed) {
      toast_notif(
        "Terms and conditions must be accepted before proceeding",
        "error",
      );
      return;
    }

    try {
      setLoading(true);
      const aspect_ratio = await getImageAspectRatio(image);

      const image_format = getRatioString(aspect_ratio);

      if (!image_format) {
        toast_notif("Invalid Image format", "error");
        return;
      }
      const fileUploaded = await uploadImage(image);
      if (!fileUploaded) throw new Error("Image upload failed");

      const file = {
        bucketId: fileUploaded.bucketId,
        fileId: fileUploaded.$id,
      };

      const packagingType = artworkUploadData.packaging_type ?? "rolled";

      const data = createUploadedArtworkData(
        {
          ...artworkUploadData,
          price: Number(priceValue),
          usd_price: Number(usdPrice),
          shouldShowPrice: displayPrice ? "Yes" : "No",
          currency: activeCurrency.code,
          packaging_type: packagingType,
        },
        file.fileId,
        user.artist_id,
        {
          role: "artist",
          designation: user.categorization,
        },
        image_format,
      );

      const uploadResponse = await uploadArtworkData(data, csrf || "");

      if (!uploadResponse?.isOk) {
        try {
          toast_notif(uploadResponse.body.message, "error");
          await storage.deleteFile({
            bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
            fileId: file.fileId,
          });
        } catch (error) {
          rollbar.error({
            context: "Artist artwork upload: Delete appwrite image",
            error,
          });
        } finally {
          setLoading(false);
        }
        return;
      }
      setImage(null);
      clearData();

      toast_notif(uploadResponse.body.message, "success");

      await queryClient.invalidateQueries({
        queryKey: ["fetch_artworks_by_id"],
      });

      setImage(null);
      router.replace("/artist/app/artworks");
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
      console.error("Error uploading artwork:", error);
      toast_notif("An error occurred. Please try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 p-4 font-sans">
      <div className="max-w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Pricing</h1>
          <p className="text-neutral-500 text-xs dark:text-neutral-400 mt-2">
            Set the price for this piece
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5 flex flex-col">
            <CurrencySetupPanel
              activeCurrency={activeCurrency}
              setActiveCurrency={setActiveCurrency}
              priceValue={priceValue}
              setPriceValue={setPriceValue}
              handleConvert={handleCurrencyConversion}
              converting={converting}
              setUsdPrice={setUsdPrice}
            />
          </div>

          <div className="lg:col-span-7 flex flex-col gap-6">
            <ConversionDisplay
              rate={conversionRate}
              result={
                usdPrice
                  ? {
                      formatted: usdPrice,
                      label: `Converted from ${activeCurrency.code}`,
                    }
                  : null
              }
              activeCurrency={activeCurrency}
            />
            <VisibilityToggle
              displayPrice={displayPrice}
              setDisplayPrice={setDisplayPrice}
            />
            <AgreementsSection
              priceConsent={priceConsent}
              setPriceConsent={setPriceConsent}
              acknowledgment={acknowledgment}
              setAcknowledgment={setAcknowledgment}
              penaltyConsent={penaltyConsent}
              setPenaltyConsent={setPenaltyConsent}
              currentStep={currentStep}
              totalSteps={3}
              isComplete={currentStep === 3}
            />
            <button
              disabled={!canUpload}
              onClick={handleArtworkUpload}
              className={BUTTON_CLASS}
            >
              {loading ? <LoadSmall /> : "Upload this artwork"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
