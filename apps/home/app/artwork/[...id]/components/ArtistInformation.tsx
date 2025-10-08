type ArtistInformationTypes = {
  name: string;
  year: string;
  location: string;
};

export default function ArtistInformation({
  name,
  year,
  location,
}: ArtistInformationTypes) {
  return (
    <div className="my-8 w-full">
      {/* Header Section */}
      <div className="py-5 px-8 bg-slate-50 w-full rounded border border-slate-100">
        <h3 className="text-slate-800 font-normal text-fluid-xxs tracking-wide">
          Artist Information
        </h3>
      </div>

      {/* Artist Details Grid */}
      <div className="w-full mt-6 bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {/* Artist Name */}
          <div className="grid grid-cols-12 px-4 py-3 hover:bg-slate-25 transition-colors duration-200">
            <div className="col-span-5 md:col-span-4">
              <p className="font-normal text-slate-700 text-fluid-xxs">
                Artist Name
              </p>
            </div>
            <div className="col-span-7 md:col-span-8">
              <p className="text-slate-900 text-fluid-xxs font-normal">
                {name}
              </p>
            </div>
          </div>

          {/* Birth Year */}
          <div className="grid grid-cols-12 px-4 py-3 hover:bg-slate-25 transition-colors duration-200">
            <div className="col-span-5 md:col-span-4">
              <p className="font-normal text-slate-700 text-fluid-xxs">
                Birth Year
              </p>
            </div>
            <div className="col-span-7 md:col-span-8">
              <p className="text-slate-900 text-fluid-xxs font-normal">
                {year}
              </p>
            </div>
          </div>

          {/* Country of Origin */}
          <div className="grid grid-cols-12 px-4 py-3 hover:bg-slate-25 transition-colors duration-200">
            <div className="col-span-5 md:col-span-4">
              <p className="font-normal text-slate-700 text-fluid-xxs">
                Country of Origin
              </p>
            </div>
            <div className="col-span-7 md:col-span-8">
              <p className="text-slate-900 text-fluid-xxs font-normal">
                {location}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
