"use client";
import React, { ChangeEvent, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AtelierInput } from "../AtelierInput";
import { ArtistInputs } from "./ArtistInputs";
import { CollectorInputs } from "./CollectorsInput";
import { IWaitlistLead, WaitlistStateData } from "@omenai/shared-types";
import { CountryDropdown } from "react-country-region-selector";
import { useCampaignTracker } from "@omenai/shared-hooks/hooks/useCampaignTracker";
import { UserType } from "./t";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { AtelierSelect } from "../AtelierSelect";
import { createWaitlistLead } from "@omenai/shared-services/analytics/createWaitlistLead";
import { allKeysEmpty } from "@omenai/shared-utils/src/checkIfObjectEmpty";

const INITIAL_WAITLIST_STATE: WaitlistStateData = {
  name: "",
  email: "",
  language: "",
  country: "",
  art_discovery_or_share_method: null,
  current_challenges: null,
  app_value_drivers: null,
  collector_type: null,
  years_of_collecting: null,
  buying_frequency: undefined,
  age: undefined,
  years_of_practice: null,
  formal_education: null,
};

export const RegistrationTerminal = () => {
  const [step, setStep] = useState<1 | 2>(1);

  const [userType, setUserType] = useState<UserType>("collector");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSetUserType = (type: UserType) => {
    setUserType(type);
    resetForm("partial");
  };
  const { getMarketingData } = useCampaignTracker();

  const resetForm = (state: "partial" | "complete") => {
    if (state === "partial")
      setWaitlistData({
        ...INITIAL_WAITLIST_STATE,
        name: waitlistData.name,
        email: waitlistData.email,
        country: waitlistData.country,
        language: waitlistData.language,
      });
    else setWaitlistData(INITIAL_WAITLIST_STATE);
  };
  const [waitlistData, setWaitlistData] = useState<WaitlistStateData>(
    INITIAL_WAITLIST_STATE,
  );

  const handleCountrySelect = (value: string) => {
    setWaitlistData((prev) => ({ ...prev, country: value }));
  };

  const handleUpdateWaitlistData = (
    e: ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;

    setWaitlistData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      waitlistData.name &&
      waitlistData.email &&
      waitlistData.country &&
      waitlistData.language
    ) {
      setStep(2);
    } else {
      toast_notif("Please complete your profile details first.", "error");
    }
  };

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
          survey: {
            art_discovery_or_share_method:
              waitlistData.art_discovery_or_share_method?.toLowerCase(),
            current_challenges: waitlistData.current_challenges?.toLowerCase(),
            app_value_drivers: waitlistData.app_value_drivers?.toLowerCase(),
          },
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
          survey: {
            art_discovery_or_share_method:
              waitlistData.art_discovery_or_share_method?.toLowerCase(),
            current_challenges: waitlistData.current_challenges?.toLowerCase(),
            app_value_drivers: waitlistData.app_value_drivers?.toLowerCase(),
          },
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
      resetForm("complete");
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
    <div className="bg-white border-l border-neutral-100 h-full flex flex-col relative overflow-hidden">
      {/* HEADER: Context-Aware */}
      <div className="p-8 border-b border-neutral-100 bg-neutral-50/30 z-20 relative">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            Step {step} of 2
          </span>
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-neutral-400 hover:text-black transition-colors"
            >
              <ArrowLeft size={12} /> Edit Profile
            </button>
          )}
        </div>
        <h2 className="font-serif text-3xl md:text-4xl text-black">
          {step === 1
            ? "Join the waitlist."
            : "Complete your waitlist profile."}
        </h2>
      </div>

      {/* FORM BODY: Animated Transition */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <AnimatePresence mode="wait">
          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleNext}
              className="p-8 space-y-4 absolute inset-0 overflow-y-auto"
            >
              {/* THE TOGGLE: "The Twist" */}
              <div className="space-y-4 mb-8">
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 block">
                  I am joining as:
                </label>
                <div className="flex border border-neutral-200 p-1 bg-neutral-50/50">
                  {(["collector", "artist"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleSetUserType(r)}
                      className={`flex-1 py-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] transition-all
                          ${userType === r ? "bg-dark text-white shadow-sm border border-neutral-100" : "text-dark bg-white border-neutral-100 hover:text-neutral-600"}
                        `}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AtelierInput
                    label="Full Name"
                    name="name"
                    value={waitlistData.name}
                    onChange={handleUpdateWaitlistData}
                    required
                    autoComplete="name"
                    placeholder="e.g. Ama Odun"
                  />
                  <AtelierInput
                    label="Email Address"
                    name="email"
                    value={waitlistData.email}
                    onChange={handleUpdateWaitlistData}
                    required
                    autoComplete="email"
                    type="email"
                    placeholder="ama@studio.com"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2 w-full">
                    <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                      Country of Residence *
                    </label>
                    <CountryDropdown
                      value={waitlistData.country}
                      onChange={(val: string) => handleCountrySelect(val)}
                      className="w-full appearance-none border-b border-neutral-300 bg-transparent py-3 font-sans focus:ring-0 text-sm text-dark focus:border-black focus:outline-none transition-colors rounded-none"
                    />
                  </div>
                  <AtelierInput
                    label="Primary Language"
                    name="language"
                    value={waitlistData.language}
                    onChange={handleUpdateWaitlistData}
                    required
                    placeholder="e.g. English, French"
                  />
                </div>
                <AtelierSelect
                  label="How do you currently discover or share art?"
                  name="art_discovery_or_share_method"
                  required
                  onChange={handleUpdateWaitlistData}
                  value={waitlistData.art_discovery_or_share_method ?? ""}
                  options={[
                    { value: "SOCIAL_MEDIA", label: "Social Media" },
                    { value: "GALLERIES", label: "Galleries" },
                    { value: "ART_FAIRS", label: "Art fairs" },
                    {
                      value: "ONLINE_MARKETPLACES",
                      label: "Online Marketplaces",
                    },
                    {
                      value: "PERSONAL_NETWORK",
                      label: "Personal network / word of mouth",
                    },
                    {
                      value: "NO_DISCOVERY_METHOD",
                      label: "I don't have a good way yet",
                    },
                  ]}
                />
                <AtelierSelect
                  label="What are the main challenges you are facing right now?"
                  name="current_challenges"
                  required
                  onChange={handleUpdateWaitlistData}
                  value={waitlistData.current_challenges ?? ""}
                  options={[
                    {
                      value: "ARTIST_VISIBILITY",
                      label: "Getting visibility as an artist",
                    },
                    {
                      value: "PERSONALIZED_ART_DISCOVERY",
                      label: "Discovering art that feels personal",
                    },
                    {
                      value: "ART_SALES_BALANCE",
                      label: "Balancing making art and managing sales",
                    },
                    {
                      value: "PRICE_PROVENANCE_TRANSPARENCY",
                      label: "Transparency with prices and provenance",
                    },
                    {
                      value: "LOGISTICS_MANAGEMENT",
                      label: "Dealing with logistics",
                    },
                    {
                      value: "ART_OVERWHELM",
                      label: "Feeling overwhelmed with all the art out there",
                    },
                    { value: "OTHER", label: "Something else" },
                  ]}
                />
                <AtelierSelect
                  label="What would make an art app worth using regularly for you?"
                  name="app_value_drivers"
                  required
                  onChange={handleUpdateWaitlistData}
                  value={waitlistData.app_value_drivers ?? ""}
                  options={[
                    {
                      value: "ARTIST_DISCOVERY",
                      label: "Better discovery of new artists",
                    },
                    {
                      value: "SIMPLIFIED_BUY_SELL",
                      label: "Simple tools to buy or sell art more easily",
                    },
                    {
                      value: "ART_COMMUNITY",
                      label: "A community for sharing knowledge and feedback",
                    },
                    {
                      value: "ARTIST_COLLECTOR_CONNECTION",
                      label: "Direct connection between artists and collectors",
                    },
                    {
                      value: "ART_EDUCATION_CONTEXT",
                      label: "Education and context around art",
                    },
                    {
                      value: "EARLY_ACCESS",
                      label: "Early access to new artists, events or features",
                    },
                  ]}
                />
              </div>

              <div className="pt-8">
                <button
                  type="submit"
                  className="group w-full bg-black text-white h-14 flex items-center justify-between px-6 hover:bg-neutral-800 transition-colors"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold">
                    Proceed
                  </span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </motion.form>
          )}

          {/* STEP 2: ROLE & KPIS */}
          {step === 2 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="p-8 md:p-12 space-y-8 absolute inset-0 overflow-y-auto"
            >
              {/* Conditional Rendering of KPI Forms */}
              {/* Note: Pass 'data' and 'handleUpdate' down to these components if you want them to be pure presentation, 
                  or keep using your existing context/state structure. 
                  Below assumes the components accept props. */}

              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {userType === "artist" ? (
                  // Pass data/handlers to ArtistForm
                  <ArtistInputs
                    waitlistData={waitlistData}
                    setWaitlistData={setWaitlistData}
                  />
                ) : (
                  // Pass data/handlers to CollectorForm
                  <CollectorInputs
                    waitlistData={waitlistData}
                    setWaitlistData={setWaitlistData}
                  />
                )}
              </div>

              <div className="pt-8 border-t border-neutral-100 mt-8">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="group w-full bg-emerald-900 text-white h-14 flex items-center justify-between px-6 hover:bg-emerald-800 transition-colors disabled:opacity-50"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold">
                    {status === "loading" ? "Submitting..." : "Join Waitlist"}
                  </span>
                  {status === "loading" ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Check className="h-5 w-5" />
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
