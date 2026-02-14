import { useEffect, useState, useMemo, useRef } from "react";
import {
  PACKAGING_PRESETS,
  PackagingPreset,
  PackagingType,
} from "./packaging_data";
import { INPUT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
import PackagingPreview from "./PackagingPreview";

interface PackagingSelectorProps {
  artDimensions: { length: number; height: number };
  packagingType: PackagingType;
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
  onTypeChange,
  onUpdate,
}: PackagingSelectorProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [isCustom, setIsCustom] = useState(false);
  const userHasManuallySwitched = useRef(false);

  // STATE: Holds the raw user input (INCHES for dims, KG for weight)
  const [customValues, setCustomValues] = useState({
    l: "",
    w: "",
    h: "",
    wg: "",
  });

  // 1. SMART FIT CHECK
  const checkFit = (preset: PackagingPreset) => {
    const artLong = Math.max(artDimensions.length, artDimensions.height);
    const artShort = Math.min(artDimensions.length, artDimensions.height);

    if (packagingType === "rolled") {
      return artShort <= preset.max_art.length;
    } else {
      const boxLong = Math.max(
        preset.max_art.length,
        preset.max_art.width || 0,
      );
      const boxShort = Math.min(
        preset.max_art.length,
        preset.max_art.width || 0,
      );
      return artLong <= boxLong && artShort <= boxShort;
    }
  };

  // 2. MEMO: Identify Best Preset
  const recommendedPreset = useMemo(() => {
    const validPresets = PACKAGING_PRESETS[packagingType].filter(checkFit);
    return validPresets.length > 0 ? validPresets[0] : null;
  }, [packagingType, artDimensions.length, artDimensions.height]);

  // 3. AUTO-SELECT
  useEffect(() => {
    if (userHasManuallySwitched.current) return;

    if (recommendedPreset) {
      setIsCustom(false);
      setSelectedPreset(recommendedPreset.id);
      setCustomValues({ l: "", w: "", h: "", wg: "" });

      // Preset data is already in CM, so we pass it directly
      onUpdate({
        length: recommendedPreset.dims_cm.length.toFixed(1),
        width: recommendedPreset.dims_cm.width.toFixed(1),
        height: recommendedPreset.dims_cm.height.toFixed(1),
        weight: recommendedPreset.weight_kg.toFixed(1),
      });
    } else {
      handleSwitchToCustom();
    }
  }, [recommendedPreset, packagingType]);

  const handleSelect = (preset: PackagingPreset) => {
    userHasManuallySwitched.current = false;
    setIsCustom(false);
    setSelectedPreset(preset.id);
    setCustomValues({ l: "", w: "", h: "", wg: "" });

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
    setCustomValues({ l: "", w: "", h: "", wg: "" });
    onUpdate({ length: "", width: "", height: "", weight: "" });
  };

  // HELPER: Convert Inches String to CM String
  const toCM = (val: string) => {
    if (!val) return "";
    const num = parseFloat(val);
    if (isNaN(num)) return "";
    return (num * 2.54).toFixed(1);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // REGEX: Only allow numbers and one decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      // 1. Update UI state (Inches)
      const updated = { ...customValues, [name]: value };
      setCustomValues(updated);

      // 2. Calculate values for Parent (Centimeters)
      // Note: We keep Weight as KG based on the label, but dimensions are converted
      onUpdate({
        length: toCM(updated.l),
        width: toCM(updated.w),
        height: toCM(updated.h),
        weight: updated.wg, // Weight is passed raw (KG)
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-300">
        <div className="flex gap-3">
          <div className="mt-0.5">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
              {packagingType === "rolled" ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 capitalize">
              {packagingType} Packaging
            </h3>
            <p className="text-xs text-slate-500 max-w-md mt-0.5">
              We've tailored these options for{" "}
              <span className="font-medium text-slate-700">
                {packagingType}
              </span>{" "}
              artworks based on your listing.
            </p>
            <p className="text-xs text-slate-500 max-w-md mt-0.5">
              Based on your artwork size{" "}
              <span className="font-mono text-slate-700 font-medium">
                ({artDimensions.length}" x {artDimensions.height}")
              </span>
              , we have recommended the best fit below.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            userHasManuallySwitched.current = false;
            onTypeChange(packagingType === "rolled" ? "stretched" : "rolled");
          }}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded transition-colors border border-transparent hover:border-indigo-100 whitespace-nowrap"
        >
          Switch to {packagingType === "rolled" ? "Stretched" : "Rolled"}?
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PACKAGING_PRESETS[packagingType].map((preset) => {
          const isCompatible = checkFit(preset);
          const isSelected = selectedPreset === preset.id && !isCustom;
          const isRecommended = recommendedPreset?.id === preset.id;

          return (
            <div
              key={preset.id}
              onClick={() => isCompatible && handleSelect(preset)}
              className={`relative group border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                !isCompatible
                  ? "opacity-60 grayscale bg-slate-50 border-slate-100"
                  : isSelected
                    ? "border-dark ring-2 ring-dark ring-offset-2 bg-white shadow-lg shadow-gray-200/50"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-md bg-white"
              }`}
            >
              {isRecommended && isCompatible && (
                <div className="absolute top-0 left-0 z-20">
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

              <div className="relative h-56 w-full bg-slate-50 flex items-center justify-center p-0 overflow-hidden">
                <div className="w-full h-full transform transition-transform duration-500 group-hover:scale-[1.02]">
                  <PackagingPreview
                    type={packagingType}
                    width={
                      packagingType === "rolled"
                        ? preset.dims_in.width
                        : preset.dims_in.width
                    }
                    height={preset.dims_in.length}
                    depth={preset.dims_in.height}
                  />
                </div>

                {isSelected && (
                  <div className="absolute top-3 right-3 bg-dark text-white rounded-full p-1.5 shadow-lg z-10 animate-in zoom-in duration-200">
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

                {!isCompatible && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                    <span className="bg-white text-red-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-red-100 uppercase tracking-wide">
                      Too Small
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100">
                <div className="flex justify-between items-start mb-1">
                  <h3
                    className={`font-semibold text-sm ${isSelected ? "text-dark" : "text-slate-700"}`}
                  >
                    {preset.label}
                  </h3>
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Max weight: {preset.weight_lbs} lbs
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

        {/* Custom Option */}
        <div
          onClick={handleSwitchToCustom}
          className={`flex flex-col items-center col-span-1 sm:col-span-2 w-full justify-center text-center p-6 border rounded-xl cursor-pointer transition-all min-h-[120px] ${
            isCustom
              ? "border-dark ring-2 ring-dark ring-offset-2 bg-slate-50"
              : "border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
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
              <h3 className="font-semibold text-sm text-slate-900">
                Custom Packaging
              </h3>
              <p className="text-xs text-slate-500">
                For oversize items or custom crates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {isCustom && (
        <div className="mt-4 p-5 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-4 bg-dark rounded-full"></span>
            <h4 className="text-sm font-semibold text-slate-900">
              Enter Exact Dimensions (IN/KG)
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
                  className={`${INPUT_CLASS} !bg-white`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Handling Note (Unchanged) */}
      <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50/50 border border-amber-100 rounded-lg">
        <div className="p-1.5 bg-amber-100 rounded-full text-amber-600 mt-0.5">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900">
            White Glove Handling Required
          </h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Please ensure artworks are packed securely with bubble wrap and
            corner protectors.
          </p>
        </div>
      </div>
    </div>
  );
}
