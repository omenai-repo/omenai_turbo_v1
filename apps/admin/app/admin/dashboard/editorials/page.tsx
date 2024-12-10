"use client";

import { editorial_database } from "@omenai/appwrite-config";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import EditorialCard from "./components/EditorialCard";

import { useQuery } from "@tanstack/react-query";

export default function Editorial_Page() {
  // const [loading, setLoading] = useState<boolean>(false);
  // const [editorials, setEditorials] = useState<EditorialSchemaTypes[]>([])

  const { data: editorials, isLoading: loading } = useQuery({
    queryKey: ["promotional_data"],
    queryFn: async () => {
      const response = await editorial_database.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_COLLECTION_ID!
      );

      if (response?.documents) {
        return response.documents.reverse();
      } else throw new Error("Something went wrong");
    },
  });

  return (
    <div>
      {loading ? (
        <div className="h-[75vh] w-full grid place-items-center">
          <Load />
        </div>
      ) : (
        <>
          <div className="mt-5 my-[3rem]">
            <h1 className="divide-y text-sm ">Omenai Editorials</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {editorials &&
              editorials.map((editorial, index) => (
                <EditorialCard
                  cover={editorial.cover}
                  title={editorial.title}
                  link={editorial.link}
                  minutes={editorial.minutes}
                  date={editorial.date}
                  key={editorial.title}
                  documentId={editorial.$id}
                />
              ))}
            {editorials?.length === 0 && <p>Nothing to display</p>}
          </div>
        </>
      )}
    </div>
  );
}
