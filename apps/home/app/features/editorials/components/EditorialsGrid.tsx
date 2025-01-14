import EditorialGridItemsList from "./EditorialGridItemsList";

export default function EditorialsGrid({ editorials }: { editorials: any }) {
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
