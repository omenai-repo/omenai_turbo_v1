"use client";
import React, { useState } from "react";
import { ArrowRight, Check, Clock } from "lucide-react";
import { ArtistInputs } from "./ArtistInputs";
import { CollectorInputs } from "./CollectorsInput";
import {
  IWaitlistLead,
  KpiMetrics,
  WaitlistStateData,
} from "@omenai/shared-types";
import { useCampaignTracker } from "@omenai/shared-hooks/hooks/useCampaignTracker";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { createWaitlistLead } from "@omenai/shared-services/analytics/createWaitlistLead";
import { allKeysEmpty } from "@omenai/shared-utils/src/checkIfObjectEmpty";
export type UserType = "artist" | "collector";

export const INITIAL_WAITLIST_STATE: WaitlistStateData = {
  name: "",
  email: "",
  language: "",
  country: "",
  collector_type: null,
  years_of_collecting: null,
  buying_frequency: undefined,
  age: undefined,
  years_of_practice: null,
  formal_education: null,
};

export const RegistrationTerminal = () => {
  const [userType, setUserType] = useState<UserType>("collector");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSetUserType = (type: UserType) => {
    setUserType(type);
    resetForm();
  };
  const { getMarketingData } = useCampaignTracker();
  const resetForm = () => {
    setWaitlistData(INITIAL_WAITLIST_STATE);
  };
  const [waitlistData, setWaitlistData] = useState<WaitlistStateData>(
    INITIAL_WAITLIST_STATE,
  );
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const marketing = getMarketingData();
      const { name, email, language, country } = waitlistData;

      // 2. Build the payload based on the active category
      let payload;

      if (userType === "artist") {
        payload = {
          name,
          email,
          language,
          country,
          entity: userType,
          kpi: {
            age: waitlistData.age,
            years_of_practice: waitlistData.years_of_practice,
            formal_education: waitlistData.formal_education,
          },
          marketing,
        };
      } else {
        payload = {
          name,
          email,
          language,
          country,
          entity: userType,
          kpi: {
            collector_type: waitlistData.collector_type,
            years_of_collecting: waitlistData.years_of_collecting,
            buying_frequency: waitlistData.buying_frequency,
          },
          marketing,
        };
      }

      if (allKeysEmpty(payload)) {
        toast_notif("Please fill in the required fields.", "error");
        return;
      }
      console.log("Waitlist Payload:", payload);
      const response = await createWaitlistLead({ ...payload } as Omit<
        IWaitlistLead,
        "hasConvertedToPaid" | "createdAt" | "device"
      >);
      if (response.isOk) {
        setStatus("success");
      } else {
        setStatus("idle");
        toast_notif("Something went wrong, please try again later.", "error");
      }
    } catch (error) {
      setStatus("idle");
      toast_notif("Something went wrong, please try again later.", "error");
    } finally {
      resetForm();
    }
  };

  if (status === "success") {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center border-[6px] border-double border-slate-100 bg-slate-50/50">
        <Check className="h-12 w-12 text-emerald-600 mb-6" strokeWidth={1.5} />
        <h3 className="font-sans text-3xl mb-4">Successfully signed up.</h3>
        <p className="font-sans text-slate-600 max-w-sm mx-auto leading-relaxed mb-8">
          You're on the list! Thanks for signing up. We'll reach out with your
          access details as soon as we open the doors.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border-l border-slate-200 h-full flex flex-col">
      {/* Terminal Header */}
      <div className="p-8 md:p-12 border-b border-slate-200 bg-slate-50">
        {/* <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-slate-400 block mb-4">
          Acquisition Protocol v1.0
        </span> */}
        <h2 className="font-sans text-4xl text-dark">Join the Waitlist.</h2>
      </div>

      {/* The "Fork in the Road" Toggle */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => handleSetUserType("collector")}
          className={`flex-1 py-6 text-center font-sans text-xs uppercase tracking-[0.2em] transition-colors relative
            ${userType === "collector" ? "text-dark bg-white" : "text-slate-400 bg-slate-100 hover:bg-slate-50"}
          `}
        >
          I am a Collector
          {userType === "collector" && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"></div>
          )}
        </button>
        <button
          type="button"
          onClick={() => handleSetUserType("artist")}
          className={`flex-1 py-6 text-center font-sans text-xs uppercase tracking-[0.2em] transition-colors relative
            ${userType === "artist" ? "text-dark bg-white" : "text-slate-400 bg-slate-100 hover:bg-slate-50"}
          `}
        >
          I am an Artist
          {userType === "artist" && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"></div>
          )}
        </button>
      </div>

      {/* Form Body */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 p-8 md:p-12 overflow-y-auto"
      >
        {/* This key forces React to remount the component when type changes, triggering the animation */}
        <div key={userType} className="mb-12">
          <p className="font-sans text-sm text-slate-500 mb-8">
            Please provide the following details below.
          </p>
          {userType === "artist" ? (
            <ArtistInputs
              waitlistData={waitlistData}
              setWaitlistData={setWaitlistData}
            />
          ) : (
            <CollectorInputs
              waitlistData={waitlistData}
              setWaitlistData={setWaitlistData}
            />
          )}
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-slate-100">
          <button
            type="submit"
            disabled={status === "loading"}
            className="group w-full bg-black text-white h-14 flex items-center justify-between px-6 hover:bg-slate-800 transition-colors disabled:bg-slate-300"
          >
            <span className="font-sans text-xs uppercase tracking-[0.2em]">
              {status === "loading" ? "Processing Request..." : "Join Waitlist"}
            </span>
            {status === "loading" ? (
              <Clock className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
