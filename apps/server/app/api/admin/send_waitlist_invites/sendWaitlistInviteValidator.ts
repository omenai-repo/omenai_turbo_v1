import { BadRequestError } from "../../../../custom/errors/dictionary/errorDictionary";

export function sendWaitlistInviteValidator(selectedUsers: unknown) {
  // validation
  if (!selectedUsers) {
    throw new BadRequestError("waitlistUsers field is required");
  }

  if (!Array.isArray(selectedUsers)) {
    throw new BadRequestError("waitlistUsers must be an array");
  }

  if (selectedUsers.length === 0) {
    throw new BadRequestError("waitlistUsers array cannot be empty");
  }

  // Validate each user object
  for (let i = 0; i < selectedUsers.length; i++) {
    const user = selectedUsers[i];

    if (!user || typeof user !== "object") {
      throw new BadRequestError(
        `Invalid user object at index ${i}: must be an object`,
      );
    }
    if (!user.name || typeof user.name !== "string") {
      throw new BadRequestError(
        `Invalid or missing name at index ${i}: must be a non-empty string`,
      );
    }
    if (!user.email || typeof user.email !== "string") {
      throw new BadRequestError(
        `Invalid or missing email at index ${i}: must be a non-empty string`,
      );
    }
    if (!user.entity || typeof user.entity !== "string") {
      throw new BadRequestError(
        `Invalid or missing entity at index ${i}: must be a non-empty string`,
      );
    }
  }
}
