import { ArtworkDimensions } from "@omenai/shared-types";

type DimensionsProps = {
  dimensions: ArtworkDimensions;
};
export default function Dimensions({ dimensions }: DimensionsProps) {
  return (
    <div className="">
      <h6 className="text-gray-700/80 text-[14px] font-semibold">
        Dimensions:
      </h6>

      <div className="w-full grid grid-cols-2 gap-x-6">
        <div>
          <div className="text-[14px] font-semibold">
            <ul className="w-full grid grid-cols-2 text-gray-700/80 justify-center gap-y-3 py-4 font-normal">
              <div>
                <li className=" font-normal">Height</li>
                <li className=" font-normal">Width</li>
              </div>

              <div>
                <li className=" font-normal">{dimensions.height}</li>
                <li className=" font-normal">{dimensions.width}</li>
              </div>
            </ul>
          </div>
        </div>
        <div>
          <div className="text-[14px]">
            <ul className="w-full grid grid-cols-2 text-gray-700/80 justify-center gap-y-3 py-4 font-normal">
              <div>
                <li className=" font-normal">Weigth</li>
                <li className=" font-normal">Depth</li>
              </div>

              <div>
                <li className=" font-normal">{dimensions.weight}</li>
                <li className=" font-normal">{dimensions.depth || `N/A`}</li>
              </div>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// <div className="text-[14px]">
//   <ul className=" flex flex-col text-gray-700/70 justify-center gap-y-3 py-4">
//     <li className=" font-normal">{dimensions.height}</li>
//     <li className=" font-normal">{dimensions.width}</li>
//   </ul>
//   <ul className=" flex flex-col text-gray-700/70 justify-center gap-y-3 py-4">
//     <li className=" font-normal">{dimensions.weight}</li>
//     <li className=" font-normal">{dimensions.depth || `N/A`}</li>
//   </ul>
// </div>
