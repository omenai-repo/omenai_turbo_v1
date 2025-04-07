import React from "react";
import Pagebar from "../components/Pagebar";
import FeatureWrapper from "./features/FeatureWrapper";
import Balances from "./features/Balances";
import ActivityChart from "./features/ActivityChart";
import Orders from "./features/Orders";

export default function page() {
  return (
    <div>
      <Pagebar />
      <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-8">
        <FeatureWrapper>
          <Balances />
        </FeatureWrapper>
        <FeatureWrapper>
          <ActivityChart />
        </FeatureWrapper>
        <FeatureWrapper>
          <Orders />
        </FeatureWrapper>
      </div>
    </div>
  );
}
