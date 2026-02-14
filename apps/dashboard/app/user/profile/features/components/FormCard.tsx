"use client";
import { FormEvent, useContext, useState } from "react";
import { InputCard } from "./InputCard";
import { updateProfile } from "@omenai/shared-services/update/updateProfile";
import { individualProfileUdateStore } from "@omenai/shared-state-store/src/individual/individual_profile_update/IndividualProfileUpdateStore";
import Preferences from "./Preferences";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useRollbar } from "@rollbar/react";
export const FormCard = () => {
  const { user, csrf } = useAuth({ requiredRole: "user" });

  const [isLoading, setIsLoading] = useState(false);

  const { updateData, clearData } = individualProfileUdateStore();

  const rollbar = useRollbar();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let newUpdateData;
    setIsLoading(true);
    try {
      if (updateData.preferences?.length === 0) {
        toast_notif("Invalid inputs", "error");
        return;
      }
      if (
        (updateData?.preferences?.length ?? 0) < 5 &&
        (updateData?.preferences?.length ?? 0) > 0
      ) {
        toast_notif("Please select up to 5 art preferences", "error");
        return;
      }
      if (updateData.name === "") {
        newUpdateData = { preferences: updateData.preferences };
      } else newUpdateData = { ...updateData };

      const { isOk, body } = await updateProfile(
        "individual",
        newUpdateData,
        user.id as string,
        csrf || "",
      );
      if (!isOk) toast_notif(body.message, "error");
      else {
        toast_notif(
          `${body.message}... Please log back in to view update`,
          "success",
        );
        clearData();
      }
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
      toast_notif("Something went wrong, please contact support", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 lg:px-2">
      <div className="grid md:grid-cols-2 gap-4">
        <InputCard
          label="Full name"
          value={user ? user.name : ""}
          onChange={() => {}}
          labelText="name"
        />
        <InputCard
          label="Email address"
          value={user ? user.email : ""}
          labelText="email"
        />
      </div>

      <div>
        <Preferences />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="h-[35px] p-5 rounded w-fit flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-light"
      >
        {isLoading ? <LoadSmall /> : "Save edit data"}
      </button>
    </form>
  );
};
