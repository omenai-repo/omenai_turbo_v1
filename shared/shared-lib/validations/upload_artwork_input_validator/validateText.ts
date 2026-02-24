import { z } from "zod";

// Regex to match emojis
const emojiRegex =
  /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])/g;
// Regex to match security-compromising characters
const unsafeCharactersRegex = /[<>{}[\]"`]/;

export const validateBasicText = (value: string): string[] => {
  const schema = z.string();
  let errors = [];

  // 1. Check minimum length
  if (!schema.min(3).safeParse(value).success) {
    errors.push("Minimum of three characters required.");
  }

  // 2. Check unsafe characters
  if (unsafeCharactersRegex.test(value)) {
    errors.push(
      'Please use plain text only. Do not include the following characters: `< > { } [ ] " ``',
    );
  }

  // 3. Check for emojis
  if (emojiRegex.test(value)) {
    errors.push(
      "Emojis are not permitted in this field. Please enter text only.",
    );
  }

  // 4. Check for sneaky encoded characters
  try {
    const decoded = decodeURIComponent(encodeURIComponent(value));
    if (decoded !== value) {
      errors.push(
        "Please enter standard plain text only. Encoded or formatted characters are not allowed.",
      );
    }
  } catch (e) {
    // If decoding itself fails (rare), still block it
    errors.push(
      "Invalid input detected. Please ensure the content contains only plain text characters",
    );
  }

  return errors;
};
