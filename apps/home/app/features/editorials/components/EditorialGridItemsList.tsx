import EditorialItem, { EditorialItemProps } from "./EditorialItem";

export default function EditorialGridItemsList({
  editorials,
}: {
  editorials: EditorialItemProps[];
}) {
  return (
    <div className="grid grid-cols-2 sm:gap-3">
      {editorials.map((editorial, index) => {
        return (
          <EditorialItem
            key={editorial.$id}
            title={editorial.title}
            date={editorial.date}
            minutes={editorial.minutes}
            cover={editorial.cover}
            summary={editorial.summary}
            $id={editorial.$id}
            link={editorial.link}
          />
        );
      })}
    </div>
  );
}
