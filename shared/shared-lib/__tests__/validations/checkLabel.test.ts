import { describe, it, expect } from "vitest";
import { checkLabel } from "../../validations/checkLabel";

describe("checkLabel", () => {
  it('maps "admin" to "general"', () => {
    expect(checkLabel("admin")).toBe("general");
  });

  it('maps "address" to "general"', () => {
    expect(checkLabel("address")).toBe("general");
  });

  it('maps "description" to "general"', () => {
    expect(checkLabel("description")).toBe("general");
  });

  it('maps "code" to "general"', () => {
    expect(checkLabel("code")).toBe("general");
  });

  it("returns the label unchanged for non-mapped labels", () => {
    expect(checkLabel("email")).toBe("email");
    expect(checkLabel("name")).toBe("name");
    expect(checkLabel("phone")).toBe("phone");
    expect(checkLabel("zip")).toBe("zip");
  });

  it("returns the label unchanged for unknown labels", () => {
    expect(checkLabel("unknown_field")).toBe("unknown_field");
  });
});
