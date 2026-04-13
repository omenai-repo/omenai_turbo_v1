"use client";

import { useState, useMemo } from "react";

// --- Types & Data ---

interface Currency {
  name: string;
  code: string;
  symbol: string;
  rate: number;
}

interface ConversionResult {
  formatted: string;
  rate: number;
  label: string;
}

// Mapped currency codes to ISO 3166-1 alpha-2 country codes for FlagCDN
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
  { name: "US Dollar ($)", code: "USD", symbol: "$", rate: 1 },
  { name: "Euro (€)", code: "EUR", symbol: "€", rate: 1.09 },
  { name: "British Pound (£)", code: "GBP", symbol: "£", rate: 1.27 },
  { name: "Canadian Dollar (C$)", code: "CAD", symbol: "C$", rate: 0.73 },
  { name: "Australian Dollar (A$)", code: "AUD", symbol: "A$", rate: 0.64 },
  { name: "Japanese Yen (¥)", code: "JPY", symbol: "¥", rate: 0.0067 },
  { name: "Swiss Franc (Fr)", code: "CHF", symbol: "Fr", rate: 1.12 },
  { name: "Chinese Yuan (¥)", code: "CNY", symbol: "¥", rate: 0.138 },
  { name: "Indian Rupee (₹)", code: "INR", symbol: "₹", rate: 0.012 },
  { name: "Nigerian Naira (₦)", code: "NGN", symbol: "₦", rate: 0.00065 },
  { name: "Kenyan Shilling (Ksh)", code: "KES", symbol: "Ksh", rate: 0.0077 },
  { name: "Ghanaian Cedi (₵)", code: "GHS", symbol: "₵", rate: 0.065 },
  { name: "South African Rand (R)", code: "ZAR", symbol: "R", rate: 0.054 },
  { name: "Egyptian Pound (E£)", code: "EGP", symbol: "E£", rate: 0.021 },
  { name: "Moroccan Dirham (MAD)", code: "MAD", symbol: "MAD", rate: 0.099 },
  {
    name: "Tanzanian Shilling (TSh)",
    code: "TZS",
    symbol: "TSh",
    rate: 0.00038,
  },
  { name: "Ugandan Shilling (USh)", code: "UGX", symbol: "USh", rate: 0.00027 },
  { name: "West African CFA (CFA)", code: "XOF", symbol: "CFA", rate: 0.0016 },
  { name: "Brazilian Real (R$)", code: "BRL", symbol: "R$", rate: 0.18 },
  { name: "Mexican Peso (Mex$)", code: "MXN", symbol: "Mex$", rate: 0.052 },
  { name: "Argentine Peso ($)", code: "ARS", symbol: "$", rate: 0.0011 },
  { name: "Colombian Peso ($)", code: "COP", symbol: "$", rate: 0.00024 },
  { name: "Singapore Dollar (S$)", code: "SGD", symbol: "S$", rate: 0.74 },
  { name: "Hong Kong Dollar (HK$)", code: "HKD", symbol: "HK$", rate: 0.128 },
  { name: "South Korean Won (₩)", code: "KRW", symbol: "₩", rate: 0.00072 },
  { name: "UAE Dirham (د.إ)", code: "AED", symbol: "د.إ", rate: 0.272 },
  { name: "Saudi Riyal (﷼)", code: "SAR", symbol: "﷼", rate: 0.266 },
  { name: "Turkish Lira (₺)", code: "TRY", symbol: "₺", rate: 0.028 },
  { name: "Swedish Krona (kr)", code: "SEK", symbol: "kr", rate: 0.094 },
  { name: "Norwegian Krone (kr)", code: "NOK", symbol: "kr", rate: 0.092 },
];

// --- Sub-Components ---

const CurrencySetupPanel = ({
  activeCurrency,
  setActiveCurrency,
  priceValue,
  setPriceValue,
  handleConvert,
  converting,
  setResult,
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
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm rounded-2xl p-6 flex flex-col h-full">
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
                    setResult(null);
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
        <div className="flex items-center border border-neutral-200 dark:border-neutral-700/80 rounded-xl overflow-hidden mb-4 bg-white dark:bg-neutral-950 focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500 transition-all">
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
              setResult(null);
            }}
            className="flex-1 h-14 px-4 text-3xl font-light bg-transparent text-neutral-900 dark:text-neutral-100 outline-none placeholder-neutral-300 dark:placeholder-neutral-700"
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

const ConversionDisplay = ({ result, activeCurrency }: any) => (
  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm rounded-2xl p-6">
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
          : `Based on current parity: 1 ${activeCurrency.code} = $${result.rate} USD`
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
  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm rounded-2xl p-6 flex items-center justify-between gap-4">
    <div>
      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
        Public Price Visibility
      </h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
        {displayPrice
          ? "Pricing is currently visible to all platform viewers."
          : "Pricing is hidden. Viewers must request a quote."}
      </p>
    </div>
    <button
      role="switch"
      aria-checked={displayPrice}
      onClick={() => setDisplayPrice((v: boolean) => !v)}
      className={`relative w-14 h-8 rounded-full transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 focus:ring-violet-500
        ${displayPrice ? "bg-green-500" : "bg-neutral-200 dark:bg-neutral-700"}`}
    >
      <span
        className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300
          ${displayPrice ? "translate-x-7" : "translate-x-1"}`}
      />
    </button>
  </div>
);

const ExclusivityAgreement = ({ checkedTerms, toggleTerm }: any) => {
  const terms = [
    { id: 1, text: "I agree that this pricing is exclusive to this platform." },
    {
      id: 2,
      text: "I confirm this asset will not be listed elsewhere at a lower price point.",
    },
    { id: 3, text: "I accept the standard 90-day pricing retention period." },
  ];

  const agreedCount = checkedTerms.length;
  const progressPercent = (agreedCount / terms.length) * 100;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm rounded-2xl p-6 flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs tracking-widest uppercase text-neutral-400 dark:text-neutral-500 font-semibold">
          3. Exclusivity Terms
        </h2>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full transition-colors duration-300 ${
            agreedCount === 3
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
          }`}
        >
          {agreedCount}/3 Agreed
        </span>
      </div>

      <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full mb-6 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out ${agreedCount === 3 ? "bg-green-500" : "bg-violet-500"}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="space-y-4 flex-1">
        {terms.map((term) => (
          <label
            key={term.id}
            className="flex items-start gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="checkbox"
                checked={checkedTerms.includes(term.id)}
                onChange={() => toggleTerm(term.id)}
                className="peer appearance-none w-5 h-5 border-2 border-neutral-300 dark:border-neutral-600 rounded bg-transparent checked:bg-violet-600 checked:border-violet-600 transition-all cursor-pointer"
              />
              <svg
                className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span
              className={`text-sm leading-snug transition-colors duration-200 ${
                checkedTerms.includes(term.id)
                  ? "text-neutral-900 dark:text-neutral-100"
                  : "text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300"
              }`}
            >
              {term.text}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

// --- Main Page Component ---

export default function PriceSetup() {
  const [activeCurrency, setActiveCurrency] = useState<Currency>(CURRENCIES[0]);
  const [priceValue, setPriceValue] = useState("");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [converting, setConverting] = useState(false);
  const [displayPrice, setDisplayPrice] = useState(false);
  const [checkedTerms, setCheckedTerms] = useState<number[]>([]);

  const handleConvert = () => {
    const val = parseFloat(priceValue);
    if (!val || val <= 0) return;

    if (activeCurrency.code === "USD") {
      setResult({
        formatted: val.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        rate: 1,
        label: "Live Match",
      });
      return;
    }

    setConverting(true);
    setTimeout(() => {
      const usd = val * activeCurrency.rate;
      const formatted =
        usd < 0.01
          ? usd.toFixed(6)
          : usd.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
      setResult({
        formatted,
        rate: activeCurrency.rate,
        label: `${activeCurrency.code} → USD`,
      });
      setConverting(false);
    }, 600);
  };

  const toggleTerm = (id: number) => {
    setCheckedTerms((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  return (
    <div className="w-full min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 p-4 md:p-8 font-sans">
      <div className="max-w-full mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Pricing Setup</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2">
            Configure your asset's base currency and agree to exclusivity terms.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5 flex flex-col">
            <CurrencySetupPanel
              activeCurrency={activeCurrency}
              setActiveCurrency={setActiveCurrency}
              priceValue={priceValue}
              setPriceValue={setPriceValue}
              handleConvert={handleConvert}
              converting={converting}
              setResult={setResult}
            />
          </div>

          <div className="lg:col-span-7 flex flex-col gap-6">
            <ConversionDisplay
              result={result}
              activeCurrency={activeCurrency}
            />
            <VisibilityToggle
              displayPrice={displayPrice}
              setDisplayPrice={setDisplayPrice}
            />
            <ExclusivityAgreement
              checkedTerms={checkedTerms}
              toggleTerm={toggleTerm}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
