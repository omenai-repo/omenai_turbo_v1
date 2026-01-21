// FullArtworkDetails.tsx
import { ArtworkResultTypes } from "@omenai/shared-types";

export default function FullArtworkDetails({
  data,
}: {
  data: ArtworkResultTypes;
}) {
  const rows = [
    { label: "Materials", value: data.materials },
    { label: "Signature", value: data.signature },
    { label: "Framing", value: data.framing },
    {
      label: "Authenticity",
      value: data.certificate_of_authenticity === "Yes" ? "Included" : "N/A",
    },
    { label: "Description", value: data.artwork_description, isLong: true },
  ];

  return (
    <div className="w-full">
      <h3 className="mb-8 font-serif text-2xl text-dark">
        Provenance & Details
      </h3>
      <dl className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`border-t border-neutral-200 pt-4 ${row.isLong ? "md:col-span-2" : ""}`}
          >
            <dt className="mb-2 font-sans text-[10px] uppercase tracking-widest text-neutral-400">
              {row.label}
            </dt>
            <dd className="font-sans text-sm leading-relaxed text-neutral-800">
              {row.value || "N/A"}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
