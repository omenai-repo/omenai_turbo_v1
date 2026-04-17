import { EditorialSchemaTypes } from "@omenai/shared-types";
import EditorialGridItemsList from "./EditorialGridItemsList";

export default function EditorialsGrid({
  editorials,
}: {
  editorials: EditorialSchemaTypes[];
}) {
  if (!editorials || editorials.length === 0) return null;

  // Ensure latest is first
  const sortedEditorials = [...editorials].sort(
    (a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime(),
  );

  return (
    <div className="w-full">
      <EditorialGridItemsList editorials={sortedEditorials} />
    </div>
  );
}
