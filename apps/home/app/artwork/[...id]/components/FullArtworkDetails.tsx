import { ArtworkResultTypes } from "@omenai/shared-types";

type FullArtworkDetailsType = {
  data: ArtworkResultTypes;
};
export default function FullArtworkDetails({ data }: FullArtworkDetailsType) {
  return (
    <div className=" my-5 w-full">
      <div className="p-4 bg-dark w-full  rounded-tl-[20px] rounded-tr-[20px]">
        <h3 className="text-white font-semibold text-[14px]">
          Additional details about this artwork
        </h3>
      </div>

      <div className="w-full text-dark/80 border border-dark/10 justify-center gap-y-3 py-4 font-normal text-xs">
        <div className="grid grid-cols-12 p-4">
          <p className="font-medium col-span-6">Materials:</p>
          <p className="col-span-6">{data.materials}</p>
        </div>
        <div className="grid grid-cols-12 p-4 ">
          <p className="font-medium col-span-6 md:col-span-6">Description:</p>
          <p className="col-span-6">{data.artwork_description || "N/A"}</p>
        </div>
        <div className="grid grid-cols-12 p-4">
          <p className="font-medium col-span-6 md:col-span-6">
            Artwork Packaging:
          </p>
          <p className="col-span-6">{data.framing}</p>
        </div>
        <div className="grid grid-cols-12 p-4">
          <p className="font-medium col-span-6 md:col-span-6">Signature:</p>
          <p className="col-span-6">{data.signature}</p>
        </div>
        <div className="grid grid-cols-12 p-4">
          <p className="font-medium col-span-6 md:col-span-6">
            Certificate of authenticity:
          </p>
          <p className="col-span-6">
            {data.certificate_of_authenticity === "Yes"
              ? "Included (Issued by Gallery)"
              : "Not available"}
          </p>
        </div>
        <div className="grid grid-cols-12 p-4">
          <p className="font-medium col-span-6 md:col-span-6">Year:</p>
          <p className="col-span-6">{data.year}</p>
        </div>
      </div>

      {/* <div className="w-full grid grid-cols-12 p-4 gap-x-8">
        <div className="col-span-6 md:col-span-6 text-xs">
          <ul className="w-full flex flex-col text-dark/80 justify-center gap-y-3 py-4">
            <li className="font-medium">Materials</li>
            <li className="font-medium">Description</li>
            <li className="font-medium">Artwork packaging</li>
            <li className="font-medium">Signature</li>
            <li className="font-medium">Certificate of Authenticity</li>
            <li className="font-medium">Year</li>
          </ul>
        </div>
        <div className="col-span-6 text-xs">
          <ul className=" flex flex-col text-dark/70 justify-center gap-y-3 py-4">
            <li>{data.materials}</li>
            <li>{data.artwork_description || "N/A"}</li>
            <li>{data.framing}</li>
            <li>{data.signature}</li>
            <li>
              {data.certificate_of_authenticity === "Yes"
                ? "Included (Issued by Gallery)"
                : "Not available"}
            </li>
            <li>{data.year}</li>
          </ul>
        </div>
      </div> */}
    </div>
  );
}
