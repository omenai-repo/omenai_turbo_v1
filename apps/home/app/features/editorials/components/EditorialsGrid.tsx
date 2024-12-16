import EditorialGridItemLarge from "./EditorialGridItemLarge";
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
      <div className="grid md:grid-cols-12 lg:gap-x-4 w-full">
        <div className="col-span-12 md:col-span-6">
          <EditorialGridItemLarge
            key={editorials[0].$id}
            editorial={editorials[0]}
          />
        </div>
        <div className="col-span-12 md:col-span-6">
          <EditorialGridItemsList editorials={editorials.slice(1, 7)} />
        </div>
      </div>
    </>
  );
}
