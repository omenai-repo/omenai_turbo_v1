import { EditorialSchemaTypes } from "@omenai/shared-types";
import EditorialGridItemsList from "./EditorialGridItemsList";

export default function EditorialsGrid({
  editorials,
}: {
  editorials: EditorialSchemaTypes[];
}) {
  if (
    editorials === null ||
    editorials === undefined ||
    editorials.length === 0
  )
    return;

  return (
    <>
      <EditorialGridItemsList editorials={editorials.slice().reverse()} />
    </>
  );
}
