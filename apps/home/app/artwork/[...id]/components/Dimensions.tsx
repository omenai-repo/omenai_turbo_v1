import { ArtworkDimensions } from "@omenai/shared-types";

type DimensionsProps = {
  dimensions: ArtworkDimensions;
};
export default function Dimensions({ dimensions }: DimensionsProps) {
  return (
    <div className="">
      <h6 className="text-dark/80 font-normal text-[14px]">Dimensions:</h6>

      <div className="w-full grid grid-cols-12 gap-x-2">
        <div className="col-span-6 md:col-span-4 text-xs">
          <ul className="w-full flex flex-col text-dark/80 justify-center gap-y-3 py-4 font-normal">
            <li>Height</li>
            <li>Width</li>
            <li>Weight</li>
            <li>Depth</li>
          </ul>
        </div>
        <div className="col-span-6 md:col-span-8 text-xs">
          <ul className=" flex flex-col text-dark/70 justify-center gap-y-3 py-4">
            <li>{dimensions.height}</li>
            <li>{dimensions.width}</li>
            <li>{dimensions.weight}</li>
            <li>{dimensions.depth || `N/A`}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
