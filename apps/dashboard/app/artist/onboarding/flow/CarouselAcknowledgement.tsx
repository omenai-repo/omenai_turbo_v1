import { artistOnboardingStore } from "@omenai/shared-state-store/src/artist/onboarding/ArtistOnboardingStateStore";
import React, { useState } from "react";
import { CiWarning } from "react-icons/ci";
import { validateOnboarding } from "./validateOnboarding";
import uploadArtistDocument from "./uploadArtistDocs";
import { onboardArtist } from "@omenai/shared-services/onboarding/onboardArtist";
import { LoadIcon } from "@omenai/shared-ui-components/components/loader/Load";
import {
  ArtistCategorizationUpdateDataTypes,
  ArtistSchemaTypes,
} from "@omenai/shared-types";
import { useSession } from "@omenai/package-provider/SessionProvider";
import { toast } from "sonner";
import { documentation_storage } from "@omenai/appwrite-config";
import { ClipLoader } from "react-spinners";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
type Option = "yes" | "no";
export default function CarouselAcknowledgement() {
  const [loading, setLoading] = useState(false);
  const { onboardingData, field_completion_state } = artistOnboardingStore();
  const { setOpenOnboardingCompletedModal } = actionStore();

  const session = useSession();

  const handleSubmit = async () => {
    const isValidated = validateOnboarding(
      onboardingData,
      field_completion_state
    );
    if (!isValidated) return;
    console.log(onboardingData);

    const {
      socials,
      cv,
      biennale,
      museum_collection,
      museum_exhibition,
      solo,
      group,
      bio,
      mfa,
      art_fair,
      graduate,
    } = onboardingData;

    try {
      setLoading(true);
      const fileUploaded = await uploadArtistDocument(cv as File);

      if (fileUploaded) {
        let file: { bucketId: string; fileId: string } = {
          bucketId: fileUploaded.bucketId,
          fileId: fileUploaded.$id,
        };

        const payload: ArtistCategorizationUpdateDataTypes = {
          documentation: { cv: file.fileId, socials },
          answers: {
            graduate: graduate as Option,
            mfa: mfa as Option,
            solo: Number(solo),
            group: Number(group),
            museum_collection: museum_collection as Option,
            biennale: biennale as "venice" | "other" | "none",
            museum_exhibition: museum_exhibition as Option,
            art_fair: art_fair as Option,
          },
          bio,
          artist_id: (session as ArtistSchemaTypes).artist_id,
        };

        const response = await onboardArtist(payload);

        if (response.isOk) {
          toast.success("Operation successful", {
            description: "Verification request sent",
            style: {
              background: "green",
              color: "white",
            },
            className: "class",
          });

          // Popup a modal right here
          setOpenOnboardingCompletedModal(true);
          // Optionally clear data
        } else {
          await documentation_storage.deleteFile(
            process.env.NEXT_PUBLIC_APPWRITE_DOCUMENTATION_BUCKET_ID!,
            file.fileId
          );
          toast.error("Error notification", {
            description: response.message,
            style: {
              background: "red",
              color: "white",
            },
            className: "class",
          });
        }
      }
    } catch (error) {
      toast.error("Error notification", {
        description: "Something went wrong. Please contact customer support",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col items-center h-[18rem] w-full p-6 bg-white focus:ring ring-1 border-0 ring-dark/10 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out rounded-[20px] shadow-md">
      <div className="w-full">
        {loading ? (
          <div className="w-full grid h-[6rem] place-items-center">
            <LoadIcon />
          </div>
        ) : (
          <span className="text-dark text-xs">
            By submitting, you confirm that all information provided is true and
            accurate. Any discrepancies may impact the verification process.
          </span>
        )}
        <div className="mt-[2rem]">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-dark whitespace-nowrap hover:bg-dark/80 disabled:cursor-not-allowed text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none disabled:bg-dark/10 disabled:text-white rounded-full h-[40px] p-6 w-full text-center text-[14px] flex items-center justify-center hover:ring-white cursor-pointer"
          >
            Submit verification request
          </button>
        </div>
      </div>
    </div>
  );
}
