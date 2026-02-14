import { BadRequestError } from "../../../../custom/errors/dictionary/errorDictionary";

export function inviteWaitlistUserValidator(selectedUsers: unknown) {
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
        `Invalid user object at index ${i}: must be an object`
      );
    }

    if (!user.waitlistId || typeof user.waitlistId !== "string") {
      throw new BadRequestError(
        `Invalid or missing waitlistId at index ${i}: must be a non-empty string`
      );
    }

    if (user.waitlistId.trim().length === 0) {
      throw new BadRequestError(
        `Invalid waitlistId at index ${i}: cannot be empty or whitespace`
      );
    }

    if (typeof user.discount !== "boolean") {
      throw new BadRequestError(
        `Invalid discount value at index ${i}: must be a boolean`
      );
    }
  }

  // Check for duplicate waitlistIds
  const waitlistIds = selectedUsers.map((user) => user.waitlistId);
  const duplicates = waitlistIds.filter(
    (id, index) => waitlistIds.indexOf(id) !== index
  );

  if (duplicates.length > 0) {
    throw new BadRequestError(
      `Duplicate waitlistIds found: ${[...new Set(duplicates)].join(", ")}`
    );
  }
}
