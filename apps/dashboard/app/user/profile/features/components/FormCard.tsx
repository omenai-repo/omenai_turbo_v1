"use client";
import { FormEvent, useContext, useState } from "react";
import { InputCard } from "./InputCard";
import { updateProfile } from "@omenai/shared-services/update/updateProfile";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { individualProfileUdateStore } from "@omenai/shared-state-store/src/individual/individual_profile_update/IndividualProfileUpdateStore";
import Preferences from "./Preferences";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";

export const FormCard = () => {
  const { session } = useContext(SessionContext);

  const user = session;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const { updateData, clearData } = individualProfileUdateStore();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let newUpdateData;

    if (updateData!.preferences!.length === 0)
      toast.error("Error notification", {
        description: "Invalid inputs",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    else if (
      updateData!.preferences!.length < 5 &&
      updateData!.preferences!.length > 0
    ) {
      toast.error("Error notification", {
        description: "Please select up to 5 art interests",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    } else if (updateData.name === "") {
      newUpdateData = { preferences: updateData.preferences };
    } else {
      newUpdateData = { ...updateData };
      setIsLoading(true);

      const { isOk, body } = await updateProfile(
        "individual",
        newUpdateData,
        session?.user_id as string
      );
      if (!isOk)
        toast.error("Error notification", {
          description: body.message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
      else {
        // todo: add update session function
        toast.success("Operation successfull", {
          description: `${body.message}... Please log back in`,
          style: {
            background: "green",
            color: "white",
          },
          className: "class",
        });
        clearData();
        router.refresh();
      }
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 lg:px-2">
      <InputCard
        label="Full name"
        value={user?.name as string}
        onChange={() => {}}
        labelText="name"
      />
      <InputCard
        label="Email address"
        value={user?.email as string}
        labelText="email"
      />

      <div>
        <Preferences />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="h-[35px] p-5 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal"
      >
        {isLoading ? <LoadSmall /> : "Save edit data"}
      </button>
    </form>
  );
};
