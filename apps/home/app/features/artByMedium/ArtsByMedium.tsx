import ArtsByMediumCard from "./components/ArtsByMediumCard";

export default function ArtsByMedium() {
  return (
    <div className=" mt-8 p-4 relative mb-[4rem]">
      <h1 className="text-dark font-normal text-fluid-md sm:text-fluid-md mb-8">
        Browse by collections
      </h1>

      <div className="flex overflow-x-scroll w-full space-x-2">
        {medium_arts.map((medium, index) => {
          return (
            <ArtsByMediumCard
              key={medium.tag}
              name={medium.name}
              tag={medium.tag}
            />
          );
        })}
      </div>
    </div>
  );
}

const medium_arts = [
  { name: "Painting", tag: "painting.jpg" },
  { name: "Drawing", tag: "drawing.jpg" },
  { name: "Contemporary art", tag: "contemporary.webp" },
  { name: "Sculpture", tag: "sculpture.jpg" },
  { name: "Textile Arts", tag: "textile.jpg" },
  { name: "Photography", tag: "photography.jpg" },
];
