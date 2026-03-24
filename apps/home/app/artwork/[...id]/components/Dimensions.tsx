import { ArtworkDimensions } from "@omenai/shared-types";

type DimensionsProps = {
  dimensions: ArtworkDimensions & { length?: string };
};

export default function Dimensions({ dimensions }: DimensionsProps) {
  return (
    <div className="w-full bg-neutral-50 p-4 border border-neutral-100">
      <h6 className="mb-4 font-sans text-[9px] uppercase tracking-widest text-neutral-400">
        Physical Specifications
      </h6>

      <div className="grid grid-cols-3 gap-y-4 gap-x-8">
        {/* Column 1 */}
        <div className="flex justify-between border-b border-neutral-200 pb-2">
          <span className="font-sans text-xs text-neutral-500">Height</span>
          <span className="font-sans text-xs text-dark">
            {dimensions.height}
          </span>
        </div>
        <div className="flex justify-between border-b border-neutral-200 pb-2">
          <span className="font-sans text-xs text-neutral-500">Width</span>
          <span className="font-sans text-xs text-dark">
            {dimensions.length ?? dimensions.width}
          </span>
        </div>
        {!!dimensions.weight && (
          <div className="flex justify-between border-b border-neutral-200 pb-2">
            <span className="font-sans text-xs text-neutral-500">Weight</span>
            <span className="font-sans text-xs text-dark">
              {dimensions.weight}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
