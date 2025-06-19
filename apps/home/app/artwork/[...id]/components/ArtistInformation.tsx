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
    <div className=" my-5 w-full text-dark">
      <div className="py-4 px-6 bg-dark/10 w-full rounded-full">
        <h3 className="text-dark font-semibold text-fluid-xs">
          Artist Information
        </h3>
      </div>

      <div className="w-full border rounded-[10px] mt-4 border-dark/10 text-dark justify-center gap-y-3 py-4 font-normal text-fluid-xs">
        <div className="grid grid-cols-12 p-4">
          <p className="font-medium col-span-6">Artist name:</p>
          <p className="col-span-6">{name}</p>
        </div>
        <div className="grid grid-cols-12 p-4 ">
          <p className="font-medium col-span-6 md:col-span-6">
            Artist birth year:
          </p>
          <p className="col-span-6">{year}</p>
        </div>
        <div className="grid grid-cols-12 p-4">
          <p className="font-medium col-span-6 md:col-span-6">
            Artist country of origin:
          </p>
          <p className="col-span-6">{location}</p>
        </div>
      </div>

      {/* <div className="w-full grid grid-cols-12 p-4 gap-x-8">
        <div className="col-span-6 md:col-span-6 text-fluid-xs">
          <ul className="w-full flex flex-col text-dark justify-center gap-y-3 py-4 font-normal">
            <p className="font-medium">Artist name</p>
            <p className="font-medium">Artist birth year</p>
            <p className="font-medium">Artist country of origin</p>
          </ul>
        </div>
        <div className="col-span-6 text-fluid-xs">
          <ul className=" flex flex-col text-dark/70 justify-center gap-y-3 py-4">
            <p>{name}</p>
            <p>{year}</p>
            <p>{location}</p>
          </ul>
        </div>
      </div> */}
    </div>
  );
}
