import { EditorialSchemaTypes } from "@omenai/shared-types";
import EditorialGridItemsList from "./EditorialGridItemsList";

export default function EditorialsGrid({
  editorials,
}: {
  editorials: EditorialSchemaTypes[];
}) {
  if (!editorials || editorials.length === 0) return null;

  // Ensure latest is first
  const sortedEditorials = editorials.slice().reverse();

  return (
    <div className="w-full">
      <EditorialGridItemsList editorials={sortedEditorials} />
    </div>
  );
}
