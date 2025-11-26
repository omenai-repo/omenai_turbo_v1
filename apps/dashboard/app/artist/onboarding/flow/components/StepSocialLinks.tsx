"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Link2, User, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import React from "react";
import { INPUT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
import { artistOnboardingStore } from "@omenai/shared-state-store/src/artist/onboarding/ArtistOnboardingStateStore";
// Assuming StepComponentProps is correctly defined in the parent context
// import { StepComponentProps } from "../OnboardingContainer";

interface SocialLink {
  type: string;
  url: string;
}

// Define the available social media options
const socialOptions = [
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "X (Twitter)" },
  { value: "behance", label: "Behance" },
  { value: "tiktok", label: "TikTok" },
];

// Define the required prefix
const HTTPS_PREFIX = "https://";
const HTTP_PREFIX = "http://";

// NOTE: I am keeping the original function signature/props,
// but adding missing imports (useEffect, useMemo, useCallback) for completeness.
// Using 'any' for StepComponentProps since the definition is external.
export default function SocialsStep({
  question,
  updateData,
  goNext,
  goBack,
  isFirstStep,
  label,
}: any) {
  const { onboardingData } = artistOnboardingStore();

  type SocialType = keyof typeof onboardingData.socials;

  const pre_socials: SocialLink[] = Object.entries(onboardingData.socials)
    .filter(([, url]) => !!url)
    .map(([rawType, url]) => ({
      type: rawType as SocialType,
      url,
    }));

  const [links, setLinks] = useState<SocialLink[]>(
    pre_socials.length === 0 ? [{ type: "", url: "" }] : pre_socials
  );

  const selectedTypes = useMemo(
    () => links.map((link) => link.type).filter(Boolean),
    [links]
  );

  const isReady = useMemo(
    () => links.some((link) => link.type && link.url.trim()),
    [links]
  );

  // Handler to update a specific link's type or URL
  const handleLinkChange = useCallback(
    (index: number, field: keyof SocialLink, value: string) => {
      setLinks((prev) =>
        prev.map((link, i) => {
          if (i === index) {
            let newValue = value;

            if (field === "url") {
              if (newValue.toLowerCase().startsWith(HTTPS_PREFIX)) {
                newValue = newValue.substring(HTTPS_PREFIX.length);
              } else if (newValue.toLowerCase().startsWith(HTTP_PREFIX)) {
                newValue = newValue.substring(HTTP_PREFIX.length);
              }

              const urlForState = newValue.trim()
                ? HTTPS_PREFIX + newValue.trim()
                : "";

              return { ...link, [field]: urlForState };
            }

            return { ...link, [field]: newValue };
          }
          return link;
        })
      );
    },
    []
  );

  const handleClickNext = () => {
    for (const link of links) {
      updateData(label, link.url, link.type);
    }
    goNext();
  };

  const addLink = () => {
    setLinks((prev) => [...prev, { type: "", url: "" }]);
  };

  const removeLink = (index: number) => {
    if (links.length > 1) {
      setLinks((prev) => prev.filter((_, i) => i !== index));
    } else {
      setLinks([{ type: "", url: "" }]);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      const validLinks = links.filter((l) => l.type && l.url.trim());
      const status =
        validLinks.length > 0 ? JSON.stringify(validLinks) : "No links entered";

      updateData(status);
    }, 300);

    return () => clearTimeout(handler);
  }, [links]);

  return (
    <div className="flex flex-col items-center">
      <Link2 className="w-12 h-12 text-purple-500 mb-6" />
      <h2 className="text-fluid-xs font-normal text-dark mb-8 text-center">
        {question}
      </h2>

      <div className="w-full max-w-lg space-y-4">
        {links.map((link, index) => {
          const displayUrl = link.url
            ? link.url.replace(HTTPS_PREFIX, "").replace(HTTP_PREFIX, "")
            : "";

          return (
            <div key={index} className="flex items-center space-x-2">
              {/* 1. Select Dropdown for Social Type */}
              <select
                value={link.type}
                onChange={(e) =>
                  handleLinkChange(index, "type", e.target.value)
                }
                className={
                  "w-1/3 p-3 bg-transparent border border-dark/30 focus:border-dark outline-none focus:ring-0 rounded transition-all duration-300 text-fluid-xxs font-normal text-dark disabled:bg-dark/10 disabled:bg-gray-50 disabled:border-dark/20 disabled:text-slate-700 disabled:cursor-not-allowed resize-none"
                }
              >
                <option value="" disabled>
                  Select Type
                </option>
                {socialOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={
                      selectedTypes.includes(option.value) &&
                      option.value !== link.type
                    }
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              <div className="flex-grow relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-fluid-xxs pointer-events-none">
                  {HTTPS_PREFIX}
                </div>
                <input
                  type="url"
                  value={displayUrl}
                  onChange={(e) =>
                    handleLinkChange(index, "url", e.target.value)
                  }
                  placeholder={`Profile Link (${link.type || "URL"})`}
                  disabled={!link.type}
                  className={
                    "w-full bg-transparent border border-dark/30 focus:border-dark outline-none focus:ring-0 rounded transition-all duration-300 text-fluid-xxs font-normal text-dark disabled:bg-dark/10 px-3 py-2.5 disabled:bg-gray-50 disabled:border-dark/20 disabled:text-slate-700 disabled:cursor-not-allowed pl-[58px]" // Increased padding-left to accommodate "https://"
                  }
                />
              </div>

              <button
                onClick={() => removeLink(index)}
                disabled={links.length === 1 && !link.type && !link.url}
                className="p-2 rounded-full text-red-500 hover:bg-red-50 disabled:text-gray-300 transition duration-150"
                title="Remove link"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          );
        })}

        <div className="flex justify-between pt-2">
          <button
            onClick={addLink}
            disabled={links.length >= socialOptions.length}
            className={`text-sm text-purple-600 hover:text-purple-800 transition font-normal text-fluid-xs ${
              links.length >= socialOptions.length
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            + Add Another Social media handle
          </button>

          {links.length > 1 && (
            <button
              onClick={() => removeLink(links.length - 1)}
              className="text-sm text-red-500 hover:text-red-700 transition font-normal text-fluid-xs"
            >
              Remove Last
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between w-full max-w-lg mt-10">
        <button
          onClick={goBack}
          disabled={isFirstStep}
          className="flex items-center text-slate-700 hover:text-gray-700 disabled:opacity-50 transition duration-150"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Back
        </button>
        <button
          onClick={handleClickNext}
          disabled={!isReady}
          className={`px-4 py-2 rounded text-fluid-xs text-white font-normal transition duration-300 ${
            isReady
              ? "bg-dark shadow-lg hover:shadow-xl"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Next <ChevronRight className="w-5 h-5 ml-1 inline-block" />
        </button>
      </div>
    </div>
  );
}
