import { useEffect, useState, useMemo, useRef } from "react";
import {
  PACKAGING_PRESETS,
  PackagingPreset,
  PackagingType,
} from "./packaging_data";
import { INPUT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
import PackagingPreview from "./PackagingPreview";
import { AlertTriangle, ArrowRightLeft, Box, Scroll } from "lucide-react";
import { checkCarrierLimit } from "@omenai/shared-utils/src/shippingLimits";

interface PackagingSelectorProps {
  artDimensions: { length: number; height: number };
  packagingType: PackagingType;
  carrier: string;
  forceCustomToggle: number;
  packagingTypeFromOrder: string;

  onTypeChange: (type: PackagingType) => void;
  onUpdate: (details: {
    length: string;
    width: string;
    height: string;
    weight: string;
  }) => void;
}

export default function PackagingSelector({
  artDimensions,
  packagingType,
  carrier,
  forceCustomToggle,
  onTypeChange,
  onUpdate,
  packagingTypeFromOrder,
}: PackagingSelectorProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [isCustom, setIsCustom] = useState(false);
  const userHasManuallySwitched = useRef(false);
  const customInputRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [customValues, setCustomValues] = useState({
    l: "",
    w: "",
    h: "",
    wg: "",
  });

  // SMART FIT CHECK
  const checkFit = (preset: PackagingPreset) => {
    const artLong = Math.max(artDimensions.length, artDimensions.height);
    const artShort = Math.min(artDimensions.length, artDimensions.height);

    // For rolled, we only care if the shortest side of the canvas fits the tube length!
    if (packagingType === "rolled") return artShort <= preset.max_art.length;

    const boxLong = Math.max(preset.max_art.length, preset.max_art.width || 0);
    const boxShort = Math.min(preset.max_art.length, preset.max_art.width || 0);
    return artLong <= boxLong && artShort <= boxShort;
  };

  // IDENTIFY BEST PRESET
  const recommendedPreset = useMemo(() => {
    const validPresets = PACKAGING_PRESETS[packagingType].filter((preset) => {
      const fitsArt = checkFit(preset);
      const isOversize = checkCarrierLimit(
        preset.dims_cm.length,
        preset.dims_cm.width || 1,
        preset.dims_cm.height || 1,
        preset.weight_kg,
        carrier,
      );
      return fitsArt && !isOversize;
    });

    return validPresets.length > 0 ? validPresets[0] : null;
  }, [packagingType, artDimensions.length, artDimensions.height, carrier]);

  // STATE RESET LISTENER
  useEffect(() => {
    userHasManuallySwitched.current = false;
    setIsCustom(false);
    containerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [packagingType]);

  // AUTO-SELECT & SMART PRE-FILL
  useEffect(() => {
    if (userHasManuallySwitched.current) return;

    if (recommendedPreset) {
      setIsCustom(false);
      setSelectedPreset(recommendedPreset.id);
      setCustomValues({ l: "", w: "", h: "", wg: "" });
      onUpdate({
        length: recommendedPreset.dims_cm.length.toFixed(1),
        width: recommendedPreset.dims_cm.width.toFixed(1),
        height: recommendedPreset.dims_cm.height.toFixed(1),
        weight: recommendedPreset.weight_kg.toFixed(1),
      });
    } else {
      // No preset fits: Switch to Custom tab and leave inputs completely blank
      setIsCustom(true);
      setSelectedPreset("");

      // Keep UI inputs blank
      setCustomValues({
        l: "",
        w: "",
        h: "",
        wg: "",
      });

      // Pass blank values to QuoteForm (this will securely lock the Submit button)
      onUpdate({
        length: "",
        width: "",
        height: "",
        weight: "",
      });
    }
  }, [recommendedPreset, packagingType, artDimensions]);

  const handleSelect = (preset: PackagingPreset) => {
    userHasManuallySwitched.current = true;
    setIsCustom(false);
    setSelectedPreset(preset.id);
    onUpdate({
      length: preset.dims_cm.length.toFixed(1),
      width: preset.dims_cm.width.toFixed(1),
      height: preset.dims_cm.height.toFixed(1),
      weight: preset.weight_kg.toFixed(1),
    });
  };

  const handleSwitchToCustom = () => {
    userHasManuallySwitched.current = true;
    setIsCustom(true);
    setSelectedPreset("");
    onUpdate({ length: "", width: "", height: "", weight: "" });
  };

  // SCROLL TRIGGER LISTENER
  useEffect(() => {
    if (forceCustomToggle > 0) {
      handleSwitchToCustom();
      setTimeout(
        () =>
          customInputRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
          }),
        150,
      );
    }
  }, [forceCustomToggle]);

  const toCM = (val: string) => {
    const num = parseFloat(val);
    return isNaN(num) ? "" : (num * 2.54).toFixed(1);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const updated = { ...customValues, [name]: value };
      setCustomValues(updated);
      onUpdate({
        length: toCM(updated.l),
        width: toCM(updated.w),
        height: toCM(updated.h),
        weight: updated.wg,
      });
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all">
        <div className="flex items-start gap-4">
          <div className="shrink-0 mt-0.5">
            <div
              className={`
              w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm
              ${
                packagingType === "rolled"
                  ? "bg-indigo-50 border-indigo-100 text-indigo-600"
                  : "bg-emerald-50 border-emerald-100 text-emerald-600"
              }
            `}
            >
              {packagingType === "rolled" ? (
                <Scroll size={20} strokeWidth={2} />
              ) : (
                <Box size={20} strokeWidth={2} />
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 capitalize tracking-tight mb-1">
              {packagingType} Packaging
            </h3>

            <div className="space-y-1">
              {packagingTypeFromOrder === packagingType && (
                <p className="text-xs text-slate-500 leading-relaxed">
                  We've tailored these options for{" "}
                  <span className="font-semibold text-slate-700">
                    {packagingType}
                  </span>{" "}
                  artworks based on your original listing.
                </p>
              )}
              <p className="text-xs text-slate-500 leading-relaxed flex flex-wrap items-center gap-1.5">
                Based on your artwork size
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-mono font-semibold text-[10px] tracking-wider">
                  {artDimensions.length}" × {artDimensions.height}"
                </span>
                we recommend the best fit below.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            userHasManuallySwitched.current = false;
            onTypeChange(packagingType === "rolled" ? "stretched" : "rolled");
          }}
          className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all active:scale-95 w-full md:w-auto"
        >
          <ArrowRightLeft
            size={14}
            strokeWidth={2}
            className="text-slate-400"
          />
          <span>
            Switch to {packagingType === "rolled" ? "Stretched" : "Rolled"}
          </span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PACKAGING_PRESETS[packagingType].map((preset) => {
          const isCompatible = checkFit(preset);
          const isOversize = checkCarrierLimit(
            preset.dims_cm.length,
            preset.dims_cm.width || 1,
            preset.dims_cm.height || 1,
            preset.weight_kg,
            carrier,
          );

          const isSelected = selectedPreset === preset.id && !isCustom;
          const isClickable = isCompatible && !isOversize;
          const isRecommended = recommendedPreset?.id === preset.id;

          // THE FIX: Explicit and foolproof styling logic
          let cardStyle =
            "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm";

          if (!isCompatible) {
            cardStyle = "opacity-60 grayscale bg-slate-50 border-slate-100";
          } else if (isOversize) {
            cardStyle = "bg-slate-50/50 border-amber-200";
          } else if (isSelected && isRecommended) {
            // It is selected AND it's the recommendation -> Full Emerald Ring
            cardStyle =
              "border-emerald-500 ring-2 ring-emerald-500 ring-offset-2 bg-white shadow-lg z-20";
          } else if (isSelected && !isRecommended) {
            // It is selected, but not recommended -> Full Dark Ring
            cardStyle =
              "border-dark ring-2 ring-dark ring-offset-2 bg-white shadow-lg z-20";
          } else if (!isSelected && isRecommended) {
            // It is recommended, but not currently selected -> Subtle Emerald Hint
            cardStyle =
              "border-emerald-400 ring-1 ring-emerald-400 ring-offset-0 bg-white shadow-md z-10";
          }

          return (
            <div
              key={preset.id}
              onClick={() => isClickable && handleSelect(preset)}
              className={`relative border rounded-xl overflow-hidden transition-all duration-300 ${isClickable ? "cursor-pointer" : "cursor-not-allowed"} ${cardStyle}`}
            >
              {isRecommended && isCompatible && (
                <div className="absolute top-0 left-0 z-30">
                  <div className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-br-lg shadow-sm uppercase tracking-wider flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Recommended Fit
                  </div>
                </div>
              )}

              {/* Overlays */}
              {!isCompatible && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                  <span className="bg-white text-red-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-red-100 uppercase tracking-wide">
                    Too Small
                  </span>
                </div>
              )}
              {isCompatible && isOversize && !isSelected && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-20 p-4">
                  <div className="bg-white border border-amber-200 shadow-md rounded-lg p-3 text-center flex flex-col items-center">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mb-1" />
                    <span className="text-amber-800 text-xs font-bold uppercase tracking-wide leading-tight">
                      Exceeds courier limits
                    </span>
                  </div>
                </div>
              )}

              <div className="relative h-56 w-full bg-slate-50 flex items-center justify-center overflow-hidden">
                <PackagingPreview
                  type={packagingType}
                  width={preset.dims_in.width}
                  height={preset.dims_in.length}
                  depth={preset.dims_in.height}
                />

                {isSelected && (
                  <div
                    className={`absolute top-3 right-3 rounded-full p-1.5 shadow-lg z-10 animate-in zoom-in duration-200 ${isRecommended ? "bg-emerald-500 text-white" : "bg-dark text-white"}`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100">
                <div className="flex justify-between items-start mb-1">
                  <h3
                    className={`font-semibold text-sm ${isSelected && isRecommended ? "text-emerald-700" : isSelected ? "text-dark" : "text-slate-700"}`}
                  >
                    {preset.label}
                  </h3>
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Max: {preset.weight_lbs} lbs
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  {preset.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  {`${preset.dims_in.length}" x ${preset.dims_in.width}" x ${preset.dims_in.height}"`}
                </div>
              </div>
            </div>
          );
        })}

        {/* Custom Option Box */}
        <div
          onClick={handleSwitchToCustom}
          className={`flex flex-col items-center col-span-1 sm:col-span-2 w-full justify-center text-center p-6 border rounded-xl cursor-pointer min-h-[120px] transition-all duration-200 ${isCustom ? "border-dark ring-2 ring-dark ring-offset-2 bg-slate-50 shadow-md" : "border-dashed border-slate-300 hover:bg-slate-50 hover:border-slate-400"}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-colors ${isCustom ? "bg-dark text-white border-dark" : "bg-white border border-slate-200 text-slate-400"}`}
            >
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={isCustom ? 2 : 1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
            </div>
            <div className="text-left">
              <h3
                className={`font-semibold text-sm ${isCustom ? "text-dark" : "text-slate-900"}`}
              >
                Custom Packaging
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                For oversize items or custom crates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {isCustom && (
        <div
          ref={customInputRef}
          className="mt-4 p-5 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 shadow-inner"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-4 bg-dark rounded-full"></span>
            <h4 className="text-sm font-semibold text-slate-900">
              Enter Exact Dimensions (IN/KG)
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {["l", "w", "h", "wg"].map((f) => (
              <div key={f}>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">
                  {f === "wg"
                    ? "Weight (kg)"
                    : `${f === "l" ? "Length" : f === "w" ? "Width" : "Height"} (in)`}
                </label>
                <input
                  name={f}
                  value={customValues[f as keyof typeof customValues]}
                  type="text"
                  inputMode="decimal"
                  placeholder="0.0"
                  onChange={handleCustomChange}
                  className={`${INPUT_CLASS} !bg-white focus:ring-2 focus:ring-dark/20 focus:border-dark transition-all`}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
