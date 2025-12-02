import { ArtworkResultTypes } from "@omenai/shared-types";

type FullArtworkDetailsType = {
  data: ArtworkResultTypes;
};

export default function FullArtworkDetails({ data }: FullArtworkDetailsType) {
  return (
    <div className="my-8 w-full">
      {/* Header Section */}
      <div className="py-5 px-8 bg-slate-100 w-full rounded-full border border-slate-100">
        <h3 className="text-slate-800 font-normal text-fluid-xxs tracking-wide">
          Additional details about this artwork
        </h3>
      </div>

      {/* Details Grid */}
      <div className="w-full mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {/* Materials */}
          <div className="grid grid-cols-12 px-4 py-3 hover:bg-slate-25 transition-colors duration-200">
            <div className="col-span-5 md:col-span-4">
              <p className="font-normal text-slate-700 text-fluid-xxs">
                Materials
              </p>
            </div>
            <div className="col-span-7 md:col-span-8">
              <p className="text-slate-900 text-fluid-xxs font-normal">
                {data.materials}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="grid grid-cols-12 px-4 py-3 hover:bg-slate-25 transition-colors duration-200">
            <div className="col-span-5 md:col-span-4">
              <p className="font-normal text-slate-700 text-fluid-xxs">
                Description
              </p>
            </div>
            <div className="col-span-7 md:col-span-8">
              <p className="text-slate-900 text-fluid-xxs font-normal leading-relaxed">
                {data.artwork_description || "N/A"}
              </p>
            </div>
          </div>

          {/* Packaging */}
          <div className="grid grid-cols-12 px-4 py-3 hover:bg-slate-25 transition-colors duration-200">
            <div className="col-span-5 md:col-span-4">
              <p className="font-normal text-slate-700 text-fluid-xxs">
                Artwork Packaging
              </p>
            </div>
            <div className="col-span-7 md:col-span-8">
              <p className="text-slate-900 text-fluid-xxs font-normal">
                {data.framing}
              </p>
            </div>
          </div>

          {/* Signature */}
          <div className="grid grid-cols-12 px-4 py-3 hover:bg-slate-25 transition-colors duration-200">
            <div className="col-span-5 md:col-span-4">
              <p className="font-normal text-slate-700 text-fluid-xxs">
                Signature
              </p>
            </div>
            <div className="col-span-7 md:col-span-8">
              <p className="text-slate-900 text-fluid-xxs font-normal">
                {data.signature}
              </p>
            </div>
          </div>

          {/* Certificate */}
          <div className="grid grid-cols-12 px-4 py-3 hover:bg-slate-25 transition-colors duration-200">
            <div className="col-span-5 md:col-span-4">
              <p className="font-normal text-slate-700 text-fluid-xxs">
                Certificate of Authenticity
              </p>
            </div>
            <div className="col-span-7 md:col-span-8">
              <p className="text-slate-900 text-fluid-xxs font-normal">
                {data.certificate_of_authenticity === "Yes"
                  ? "Included"
                  : "Not available"}
              </p>
            </div>
          </div>

          {/* Year */}
          <div className="grid grid-cols-12 px-4 py-3 hover:bg-slate-25 transition-colors duration-200">
            <div className="col-span-5 md:col-span-4">
              <p className="font-normal text-slate-700 text-fluid-xxs">Year</p>
            </div>
            <div className="col-span-7 md:col-span-8">
              <p className="text-slate-900 text-fluid-xxs font-normal">
                {data.year}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
