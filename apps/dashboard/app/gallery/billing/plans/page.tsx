"use client";
import PageTitle from "../../components/PageTitle";
import { useQuery } from "@tanstack/react-query";
import { getAllPlanData } from "@omenai/shared-services/subscriptions/getAllPlanData";
import PlanWrapper from "./PlanWrapper";
import { useRouter } from "next/navigation";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { getApiUrl } from "@omenai/url-config/src/config";
import { useContext } from "react";
import { auth_uri } from "@omenai/url-config/src/config";

export default function Plans() {
  const auth_url = auth_uri();
  const { session } = useContext(SessionContext);
  const router = useRouter();
  const url = getApiUrl();
  if (session === null || session === undefined)
    router.replace(`${auth_url}/login`);
  const { data, isLoading } = useQuery({
    queryKey: ["get_all_plan_details"],
    queryFn: async () => {
      const plans = await getAllPlanData();
      const res = await fetch(`${url}/api/subscriptions/retrieveSubData`, {
        method: "POST",
        body: JSON.stringify({ gallery_id: session!.gallery_id }),
      });

      const result = await res.json();
      if (!plans?.isOk || !res?.ok) throw new Error("Something went wrong");
      else return { plans: plans.data, sub: result.data };
    },
    refetchOnWindowFocus: false,
  });

  return (
    <div>
      <PageTitle title="Pricing plans" />
      {isLoading ? (
        <div className="h-[75vh] w-full grid place-items-center">
          <Load />
        </div>
      ) : (
        <>
          <div className="mt-10 text-center">
            <p className="text-fluid-base leading-4 text-[#858585] ">
              Choose your plan
            </p>
            <h1
              role="heading"
              className="text-fluid-xl font-bold leading-10 mt-3 text-dark"
            >
              Our pricing plans
            </h1>
          </div>
          <PlanWrapper plans={data?.plans} sub_data={data?.sub} />
        </>
      )}
    </div>
  );
}
