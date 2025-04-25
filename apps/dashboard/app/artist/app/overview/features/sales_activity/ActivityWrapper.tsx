"use client";
import { getSalesActivityData } from "@omenai/shared-services/sales/getSalesActivityData";
import OverviewComponentCard from "../../components/OverviewComponentCard";
import { salesDataAlgorithm } from "@omenai/shared-utils/src/salesDataAlgorithm";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useContext, useMemo } from "react";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import Load, {
  LoadIcon,
} from "@omenai/shared-ui-components/components/loader/Load";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { auth_uri } from "@omenai/url-config/src/config";
import { ArtistSchemaTypes } from "@omenai/shared-types";
import { SalesActivityChart } from "./components/SalesActivity";
import Dropdown from "../../components/Dropdown";
import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";

export default function ActivityWrapper() {
  const { session } = useContext(SessionContext);
  const { sales_activity_year } = artistActionStore();
  const router = useRouter();
  const url = auth_uri();
  if (session === undefined) router.replace(url);
  const { data: sales, isLoading } = useQuery({
    queryKey: ["get_overview_sales_activity", sales_activity_year],
    queryFn: async () => {
      const data = await getSalesActivityData(
        (session as ArtistSchemaTypes).artist_id as string,
        sales_activity_year
      );
      if (data?.isOk) {
        return data.data;
      }
    },
    enabled: !!sales_activity_year,
    staleTime: 0, // Data is considered stale immediately
    refetchOnWindowFocus: false,
  });

  const memoizedData = useMemo(
    () => salesDataAlgorithm(sales, "Sales Revenue ($)"),
    [sales, "Sales Revenue ($)"]
  );

  return (
    <div className="h-[400px] mt-8 relative">
      <div className="flex justify-between items-center mr-[50px]">
        <h1 className="font-medium">Sales Revenue</h1>
        <Dropdown />
      </div>
      <div className="h-full w-full grid place-items-center">
        {isLoading ? (
          <LoadIcon />
        ) : (
          <SalesActivityChart
            data={[memoizedData]}
            year={sales_activity_year}
          />
        )}
      </div>
    </div>
  );
}
