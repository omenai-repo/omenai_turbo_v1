"use client";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { fetchHighlightData } from "@omenai/shared-services/overview_highlights/fetchHighlightData";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
type HightlightCardProps = {
  title: string;
  icon: React.ReactNode;
  tag: string;
};
export default function HighlightCard({ tag }: HightlightCardProps) {
  const { session } = useContext(SessionContext);
  const { data, isLoading } = useQuery({
    queryKey: [`highlight`, tag],
    queryFn: async () => {
      const data = await fetchHighlightData(
        tag,
        session?.gallery_id as string,
        session?.subscription_active as boolean
      );
      return data;
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <LoadSmall />;

  return <h4 className="font-normal text-xs text-dark">{data}</h4>;
}
