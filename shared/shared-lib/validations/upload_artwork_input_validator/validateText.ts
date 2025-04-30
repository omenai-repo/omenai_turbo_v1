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
    errors.push("3 letters minimum, buddy. You got this.");
  }

  // 2. Check unsafe characters
  if (unsafeCharactersRegex.test(value)) {
    errors.push('Keep it clean, bestie ✨ No `< > { } [ ] " `` in here!');
  }

  // 3. Check for emojis
  if (emojiRegex.test(value)) {
    errors.push("No emojis here. Strictly text, pls!");
  }

  // 4. Check for sneaky encoded characters
  try {
    const decoded = decodeURIComponent(encodeURIComponent(value));
    if (decoded !== value) {
      errors.push("Keep it plain please, 🧼. No funny encoded stuff!");
    }
  } catch (e) {
    // If decoding itself fails (rare), still block it
    errors.push("Something looks sus 👀. Stick to plain text, bestie!");
  }

  return errors;
};
