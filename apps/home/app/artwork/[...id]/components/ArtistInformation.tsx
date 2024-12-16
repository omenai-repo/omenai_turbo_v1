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
    <div className=" m-5 lg:w-[1000px] border border-dark/10">
      <div className="p-4 bg-[#FAFAFA] border-dark/10 w-full">
        <h3 className="text-dark/80 font-semibold text-[14px]">
          Artist Information
        </h3>
      </div>

      <div className="w-full text-dark/80 justify-center gap-y-3 py-4 font-normal text-xs">
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
        <div className="col-span-6 md:col-span-6 text-xs">
          <ul className="w-full flex flex-col text-dark/80 justify-center gap-y-3 py-4 font-normal">
            <p className="font-medium">Artist name</p>
            <p className="font-medium">Artist birth year</p>
            <p className="font-medium">Artist country of origin</p>
          </ul>
        </div>
        <div className="col-span-6 text-xs">
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
