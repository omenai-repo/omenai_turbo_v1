import { ArtworkDimensions } from "@omenai/shared-types";

type DimensionsProps = {
  dimensions: ArtworkDimensions;
};
export default function Dimensions({ dimensions }: DimensionsProps) {
  return (
    <div className="">
      <h6 className="text-dark leading-snug text-fluid-base font-medium ">
        Dimensions:
      </h6>

      <div className="w-full grid grid-cols-2 gap-x-6">
        <div>
          <div className="text-fluid-xxs font-medium">
            <ul className="w-full grid grid-cols-2 text-dark justify-center gap-y-3 py-4 font-normal">
              <div>
                <li className=" font-normal text-fluid-xxs">Height:</li>
                <li className=" font-normal text-fluid-xxs">Width:</li>
              </div>

              <div>
                <li className=" font-normal text-fluid-xxs">
                  {dimensions.height}
                </li>
                <li className=" font-normal text-fluid-xxs">
                  {dimensions.width}
                </li>
              </div>
            </ul>
          </div>
        </div>
        <div>
          <div className="text-fluid-xxs">
            <ul className="w-full grid grid-cols-2 text-dark justify-center gap-y-3 py-4 font-normal">
              <div>
                <li className=" font-normal text-fluid-xxs">Weigth:</li>
                <li className=" font-normal text-fluid-xxs">Depth:</li>
              </div>

              <div>
                <li className=" font-normal text-fluid-xxs">
                  {dimensions.weight}
                </li>
                <li className=" font-normal text-fluid-xxs">
                  {dimensions.depth || `N/A`}
                </li>
              </div>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// <div className="text-fluid-xxs">
//   <ul className=" flex flex-col text-dark/70 justify-center gap-y-3 py-4">
//     <li className=" font-normal text-fluid-xxs">{dimensions.height}</li>
//     <li className=" font-normal text-fluid-xxs">{dimensions.width}</li>
//   </ul>
//   <ul className=" flex flex-col text-dark/70 justify-center gap-y-3 py-4">
//     <li className=" font-normal text-fluid-xxs">{dimensions.weight}</li>
//     <li className=" font-normal text-fluid-xxs">{dimensions.depth || `N/A`}</li>
//   </ul>
// </div>
