"use client";
import { SalesActivity } from "./components/SalesActivity";
import { getSalesActivityData } from "@omenai/shared-services/sales/getSalesActivityData";
import OverviewComponentCard from "../../components/OverviewComponentCard";
import { salesDataAlgorithm } from "@omenai/shared-utils/src/salesDataAlgorithm";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { login_url } from "@omenai/url-config/src/config";

export default function ActivityWrapper() {
  const { session } = useContext(SessionContext);
  const router = useRouter();
  const url = login_url();
  if (session === undefined) router.replace(url);
  const { data: sales, isLoading } = useQuery({
    queryKey: ["get_overview_sales_activity"],
    queryFn: async () => {
      const data = await getSalesActivityData(session?.gallery_id as string);
      if (data?.isOk) {
        return data.data;
      }
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading)
    return (
      <div className="h-[40vh] grid place-items-center">
        <Load />
      </div>
    );

  const activityData = salesDataAlgorithm(sales);

  return (
    <>
      <OverviewComponentCard
        fullWidth={false}
        title={"Sales Revenue ($)"}
        id="tour-orders"
      >
        {sales.length === 0 ? (
          <div className="w-full h-full grid pb-10">
            <NotFoundData />
          </div>
        ) : (
          <SalesActivity activityData={activityData} />
        )}
      </OverviewComponentCard>
    </>
  );
}
