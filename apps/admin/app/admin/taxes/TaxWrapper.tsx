import React from "react";
import NexusState from "./components/NexusState";
import { nexus_states } from "./nexus_states_list";

export default function TaxWrapper() {
  return (
    <div>
      <div className="flex flex-col space-y-3">
        {nexus_states.map((state) => {
          return (
            <NexusState
              key={state.code}
              state={state.state}
              code={state.code}
              flag_url={state.flag_url}
            />
          );
        })}
      </div>
    </div>
  );
}
