import { describe, it, expect } from "vitest";
import { encodeMediumForUrl } from "../encodeMediumUrl";
import { decodeMediumFromUrl } from "../decodeMediumForUrl";

describe("encodeMediumForUrl", () => {
  it("encodes Photography", () => {
    expect(encodeMediumForUrl("Photography")).toBe("photography");
  });

  it("encodes Works on paper", () => {
    expect(encodeMediumForUrl("Works on paper")).toBe("works-on-paper");
  });

  it("encodes Acrylic on canvas/linen/panel", () => {
    expect(encodeMediumForUrl("Acrylic on canvas/linen/panel")).toBe(
      "acrylic-on-canvas-linen-panel"
    );
  });

  it("encodes Mixed media on canvas", () => {
    expect(encodeMediumForUrl("Mixed media on canvas")).toBe(
      "mixed-media-on-paper-canvas"
    );
  });

  it("encodes Oil on canvas/panel", () => {
    expect(encodeMediumForUrl("Oil on canvas/panel")).toBe(
      "oil-on-canvas-panel"
    );
  });
});

describe("decodeMediumFromUrl", () => {
  it("decodes the photography slug", () => {
    expect(decodeMediumFromUrl("photography")).toBe("Photography");
  });

  it("decodes the works-on-paper slug", () => {
    expect(decodeMediumFromUrl("works-on-paper")).toBe("Works on paper");
  });

  it("decodes the acrylic slug", () => {
    expect(decodeMediumFromUrl("acrylic-on-canvas-linen-panel")).toBe(
      "Acrylic on canvas/linen/panel"
    );
  });

  it("decodes the oil slug", () => {
    expect(decodeMediumFromUrl("oil-on-canvas-panel")).toBe(
      "Oil on canvas/panel"
    );
  });

  it("returns null for an unknown slug", () => {
    expect(decodeMediumFromUrl("unknown-medium")).toBeNull();
  });

  it("normalises input to lowercase before lookup", () => {
    expect(decodeMediumFromUrl("PHOTOGRAPHY")).toBe("Photography");
  });
});

describe("encode → decode round-trip", () => {
  const mediums = [
    "Photography",
    "Works on paper",
    "Acrylic on canvas/linen/panel",
    "Oil on canvas/panel",
  ] as const;

  for (const medium of mediums) {
    it(`round-trips "${medium}"`, () => {
      expect(decodeMediumFromUrl(encodeMediumForUrl(medium))).toBe(medium);
    });
  }
});
