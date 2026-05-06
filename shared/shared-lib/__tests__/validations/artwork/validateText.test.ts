import { describe, it, expect } from "vitest";
import { validateBasicText } from "../../../validations/upload_artwork_input_validator/validateText";

describe("validateBasicText", () => {
  it("returns empty array for valid plain text", () => {
    expect(validateBasicText("Starry Night")).toHaveLength(0);
  });

  it("returns error when text is shorter than 3 characters", () => {
    const errors = validateBasicText("AB");
    expect(errors).toContain("Minimum of three characters required.");
  });

  it("returns error for empty string", () => {
    const errors = validateBasicText("");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error when text contains < character", () => {
    const errors = validateBasicText("Hello <script>");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error when text contains > character", () => {
    const errors = validateBasicText("A > B");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error when text contains { character", () => {
    const errors = validateBasicText("key{value}");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error when text contains [ character", () => {
    const errors = validateBasicText("array[0]");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error when text contains backtick", () => {
    const errors = validateBasicText("code `snippet`");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error when text contains double quote", () => {
    const errors = validateBasicText('Say "hello"');
    expect(errors.length).toBeGreaterThan(0);
  });

  it("accepts text with special non-blocked characters (hyphen, apostrophe)", () => {
    expect(validateBasicText("Mother's Day")).toHaveLength(0);
  });

  it("accepts text with numbers", () => {
    expect(validateBasicText("Version 2024")).toHaveLength(0);
  });
});
