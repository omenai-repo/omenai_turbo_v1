import React, { useState } from "react";
import { VerificationInfoType } from "./ArtistInfoWrapper";
import { Paper, Image, Box, Button, Select } from "@mantine/core";
import { getGalleryLogoFileView } from "@omenai/shared-lib/storage/getGalleryLogoFileView";

import {
  ArtistCategorizationAnswerTypes,
  ArtistCategory,
  Socials,
} from "@omenai/shared-types";
import { SocialLinks } from "./Socials";
import CategorizationAnswers from "./CategorizationAnswers";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { acceptArtistVerification } from "@omenai/shared-services/admin/accept_artist_verification";
import { rejectArtistVerification } from "@omenai/shared-services/admin/reject_artist_verification";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ArtistInfo({ data }: { data: VerificationInfoType }) {
  const { artist, request } = data;
  const [recommendation, setRecommedation] = useState<ArtistCategory>(
    request.categorization.artist_categorization as ArtistCategory
  );
  const [loading, setLoading] = useState(false);
  const { artist_id, name, email } = artist;
  const queryClient = useQueryClient();
  const router = useRouter();
  const { csrf } = useAuth({ requiredRole: "admin" });
  const handleRequestAction = async (type: "accept" | "reject") => {
    try {
      setLoading(true);

      const response =
        type === "accept"
          ? await acceptArtistVerification(
              artist_id,
              recommendation,
              csrf || ""
            )
          : await rejectArtistVerification(artist_id, name, email, csrf || "");

      if (!response.isOk) {
        toast.error("Error notification ", {
          description: response.message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
        return;
      }

      toast.success("Operation successful ", {
        description: response.message,
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });
      await queryClient.invalidateQueries({
        queryKey: ["fetch_artists_on_verif_status"],
      });
      router.replace("/admin/requests/artist");
    } catch (error) {
      toast.error("Error notification ", {
        description:
          "An error was encountered, please try later or contact support",
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

  const image_href = getGalleryLogoFileView(data!.artist!.logo, 300);
  return (
    <div className="w-full px-5">
      <div>
        <Paper radius={"lg"}>
          <div className="flex gap-x-4 items-center">
            <div className=" border-white rounded-full">
              <Image radius={"100%"} h={100} w={100} src={image_href} />
            </div>

            <div className="space-y-1">
              <h1 className="font-semibold text-fluid-lg">{artist.name}</h1>
              <p className="font-normal text-fluid-xs text-dark/80">
                Art Style: {artist.art_style}
              </p>
              <p className="font-normal text-fluid-xs text-dark/80">
                {artist.address.state}, {artist.address.country}
              </p>

              <div className="flex gap-x-2">
                <div className="">
                  <SocialLinks socials={artist.documentation?.socials} />
                </div>
              </div>
            </div>
          </div>

          <div className=" my-5 flex gap-x-4 items-center">
            <Button variant="filled" color="#1a1a1a">
              Download Resume
            </Button>
            <Button
              disabled={loading}
              variant="filled"
              loading={loading}
              color="green"
              onClick={() => handleRequestAction("accept")}
            >
              Accept Artist
            </Button>
            <Button
              disabled={loading}
              variant="filled"
              color="red"
              loading={loading}
              onClick={() => handleRequestAction("reject")}
            >
              Reject Artist
            </Button>
          </div>

          <div className="my-5">
            <h1 className="font-semibold text-fluid-md">
              Artist Onboarding Information
            </h1>

            <div className="my-5">
              <CategorizationAnswers
                answers={
                  request?.categorization
                    .answers as ArtistCategorizationAnswerTypes
                }
              />
            </div>

            <div className="my-5">
              <div>
                <h4 className="font-medium text-fluid-base text-dark/70">
                  Recommended category for this artist:
                </h4>

                <h1 className="font-bold text-fluid-lg">
                  {request?.categorization.artist_categorization}
                </h1>
              </div>

              <div className="w-fit mt-4">
                <Select
                  label="Change this artist's recommendation"
                  placeholder="Select a new recommendation"
                  onChange={(value) => {
                    if (value) setRecommedation(value as ArtistCategory);
                  }}
                  defaultValue={request?.categorization.artist_categorization}
                  comboboxProps={{
                    transitionProps: { transition: "pop", duration: 200 },
                  }}
                  data={[
                    "Emerging",
                    "Early Mid-career",
                    "Mid-career",
                    "Late Mid-career",
                    "Established",
                    "Elite",
                  ]}
                  allowDeselect={false}
                />
              </div>
            </div>
          </div>
        </Paper>
      </div>
    </div>
  );
}
