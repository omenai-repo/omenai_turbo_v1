export const declineReasonMapping: Record<string, string> = {
  // 1. Artist’s personal attachment
  "I’ve decided to keep this artwork":
    "The artist has decided to retain this piece and it’s no longer available for sale.",

  // 2. Outdated or no longer representative
  "This artwork no longer represents my current work":
    "The artist has chosen to withdraw this piece from sale.",

  // 3. Reserved for an exhibition
  "I need this artwork for an upcoming exhibition or event":
    "The artwork has been reserved for an upcoming exhibition or event.",

  // 7. Already sold elsewhere
  "This artwork has already been sold elsewhere":
    "This artwork has recently been sold and is no longer available.",

  // 8. Damaged or missing
  "The artwork is damaged or missing":
    "This artwork is currently unavailable for purchase.",

  // 10. Under exclusivity or gallery contract
  "This artwork is under an exclusivity or gallery agreement":
    "This artwork is currently under an exclusive arrangement and cannot be sold at this time.",

  // 19. Paused selling
  "I’ve paused selling on Omenai for now":
    "The artist has temporarily paused new orders on the platform.",
};
