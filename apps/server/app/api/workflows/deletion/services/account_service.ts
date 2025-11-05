import { hashEmail } from "@omenai/shared-lib/encryption/encrypt_email";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";

export function accountService(
  targetId: string,
  metadata: Record<string, any>
) {}

async function ArtistAccount(targetId: string) {
  try {
    const artist = await AccountArtist.findOne({ artist_id: targetId });
    AccountArtist.updateOne(
      {
        artist_id: targetId,
      },
      {
        $set: {
          name: "Deleted Artist",
          email: hashEmail(artist.email),
          bio: "",
          art_style: [],
          categorization: "",
          password: "",
        },
      }
    );
  } catch (error) {
    console.error("Failed anonymization", error);
    throw error;
  }
}
