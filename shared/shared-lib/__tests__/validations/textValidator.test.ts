import { describe, it, expect } from "vitest";
import { validateText } from "../../validations/textValidator";

describe("validateText", () => {
  it("returns empty array for text with 3+ characters", () => {
    expect(validateText("John Doe")).toHaveLength(0);
  });

  it("returns empty array for exactly 3 characters", () => {
    expect(validateText("Ana")).toHaveLength(0);
  });

  it("returns error for text shorter than 3 characters", () => {
    const errors = validateText("Jo");
    expect(errors).toContain(
      "Seems like you left this field blank or it's too short. Please provide full name."
    );
  });

  it("returns error for empty string", () => {
    const errors = validateText("");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error for single character", () => {
    const errors = validateText("A");
    expect(errors.length).toBeGreaterThan(0);
  });
});
