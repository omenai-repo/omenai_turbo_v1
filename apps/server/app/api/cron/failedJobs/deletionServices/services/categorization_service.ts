import { ArtistCategorization } from "@omenai/shared-models/models/artist/ArtistCategorizationSchema";
import { FailedCronJobTypes } from "@omenai/shared-types";
import { processFailedJobs, handleDeleteWithRetry } from "./utils";

export async function categorizationService(jobs: FailedCronJobTypes[]) {
  return processFailedJobs(jobs, (job) =>
    handleDeleteWithRetry(job.payload.artist_id, () =>
      ArtistCategorization.deleteOne({ artist_id: job.payload.artist_id })
    )
  );
}
