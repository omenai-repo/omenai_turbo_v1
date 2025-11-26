"use client";
import { useState, useMemo, useCallback } from "react";
import { onboardingOptions } from "./components/onboardingOptions";
import ConfirmationStep from "./components/StepConfirmation";
import CVUploadStep from "./components/StepCVUpload";
import SelectStep from "./components/StepSelect";
import TextStep from "./components/StepTextInput";
import StepWrapper from "./components/StepWrapper";
import SocialsStep from "./components/StepSocialLinks";
import { artistOnboardingStore } from "@omenai/shared-state-store/src/artist/onboarding/ArtistOnboardingStateStore";
import { ArtistOnboardingData, Socials } from "@omenai/shared-types";

// Define the shape of the data collected from the artist
export type ArtistData = ArtistOnboardingData;

// Props for individual step components
export interface StepComponentProps {
  label: string;
  question: string;
  options?: string[];
  currentValue: any;
  updateData: (label: string, value: any) => void;
  goNext: () => void;
  goBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  placeholder?: string;
}

export default function OnboardingContainer() {
  const { updateOnboardingData, onboardingData } = artistOnboardingStore();
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = onboardingOptions.length;
  const currentOption = onboardingOptions[currentStep];

  const goNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep, totalSteps]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  const updateData = useCallback((label: keyof ArtistData, value: string) => {
    updateOnboardingData(currentOption.label as keyof ArtistData, value);
  }, []);

  const stepProps: Omit<StepComponentProps, "question" | "options"> & {
    label: string;
  } = useMemo(
    () => ({
      label: currentOption.label as keyof ArtistData,
      currentValue: onboardingData[currentOption.label as keyof ArtistData],
      updateData: (
        label: string,
        value: any,
        socialKey?: keyof (typeof onboardingData)["socials"]
      ) => updateOnboardingData(label as keyof ArtistData, value, socialKey),
      goNext,
      goBack,
      isFirstStep: currentStep === 0,
      isLastStep: currentStep === totalSteps - 1,
    }),
    [
      currentStep,
      currentOption,
      onboardingData,
      goNext,
      goBack,
      totalSteps,
      updateData,
    ]
  );

  const renderStep = () => {
    switch (currentOption.type) {
      case "text":
        return (
          <TextStep
            {...stepProps}
            question={currentOption.question}
            updateData={stepProps.updateData}
            currentValue={stepProps.currentValue}
            placeholder={currentOption.placeholder}
          />
        );
      case "select":
        return (
          <SelectStep
            {...stepProps}
            currentValue={stepProps.currentValue}
            question={currentOption.question}
            options={currentOption.options}
          />
        );
      case "cv":
        return (
          <CVUploadStep {...stepProps} question={currentOption.question} />
        );
      case "socials":
        return <SocialsStep {...stepProps} question={currentOption.question} />;
      case "confirmation":
        return (
          <ConfirmationStep {...stepProps} question={currentOption.question} />
        );
      default:
        return <div className="text-red-500">Error: Unknown step type.</div>;
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 font-sans flex flex-col items-center py-10 px-4 overflow-hidden">
      {/* Animated Dot Mesh Background */}
      <div
        className="absolute inset-0 z-0 opacity-90 animate-background-move"
        style={{
          // Uses a subtle CSS background image for the dot mesh effect
          backgroundImage: `radial-gradient(circle, #d4d4d4 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />
      {/* Page content */}
      <header className="mb-10 text-center relative z-10">
        <h1 className="text-fluid-xl font-bold text-dark">
          Your Artistic Journey so far
        </h1>
        <p className="text-slate-700 font-normal mt-2 text-fluid-xs">
          Share a bit about your creative journey and how it has evolved.
        </p>
      </header>
      <StepWrapper currentStepIndex={currentStep} totalSteps={totalSteps}>
        {renderStep()}
      </StepWrapper>
    </div>
  );
}
