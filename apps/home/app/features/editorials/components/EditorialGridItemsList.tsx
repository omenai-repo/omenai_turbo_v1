import EditorialItemCard from "@omenai/shared-ui-components/components/editorials/EditorialItemCard";
import { EditorialSchemaTypes } from "@omenai/shared-types";

export default function EditorialGridItemsList({
  editorials,
}: {
  editorials: EditorialSchemaTypes[];
}) {
  return (
    // Grid Setup: 3 Columns. Rows are fixed to 350px height.
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[350px]">
      {/* SLICE UPDATED TO 6: 
          1 Featured (2x2) + 5 Standard (1x1) = Perfect 3x3 Grid Block 
      */}
      {editorials.slice(0, 6).map((editorial, index) => {
        const isFeatured = index === 0;

        return (
          <div
            key={editorial.slug}
            className={`
                relative w-full h-full
                ${isFeatured ? "md:col-span-2 md:row-span-2" : "md:col-span-1 md:row-span-1"}
            `}
          >
            <EditorialItemCard
              editorial={{ ...editorial }}
              isFeatured={isFeatured}
            />
          </div>
        );
      })}
    </div>
  );
}
