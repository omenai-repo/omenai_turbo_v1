import { describe, it, expect } from "vitest";
import { generateGhostArtistStub } from "../../auth/generateGhostArtist";

describe("generateGhostArtistStub", () => {
  it("sets the provided name on the stub", () => {
    const stub = generateGhostArtistStub("John Doe");
    expect(stub.name).toBe("John Doe");
  });

  it("sets profile_status to ghost", () => {
    expect(generateGhostArtistStub("Artist").profile_status).toBe("ghost");
  });

  it("sets verified to false", () => {
    expect(generateGhostArtistStub("Artist").verified).toBe(false);
  });

  it("sets artist_verified to false", () => {
    expect(generateGhostArtistStub("Artist").artist_verified).toBe(false);
  });

  it("sets isOnboardingCompleted to false", () => {
    expect(generateGhostArtistStub("Artist").isOnboardingCompleted).toBe(false);
  });

  it("sets role to artist", () => {
    expect(generateGhostArtistStub("Artist").role).toBe("artist");
  });

  it("sets base_currency to USD", () => {
    expect(generateGhostArtistStub("Artist").base_currency).toBe("USD");
  });

  it("generates a non-empty artist_id (UUID)", () => {
    const stub = generateGhostArtistStub("Artist");
    expect(stub.artist_id).toBeTruthy();
    expect(typeof stub.artist_id).toBe("string");
  });

  it("generates a unique artist_id on every call", () => {
    const a = generateGhostArtistStub("Artist A");
    const b = generateGhostArtistStub("Artist B");
    expect(a.artist_id).not.toBe(b.artist_id);
  });

  it("initializes address with all-empty string fields", () => {
    const stub = generateGhostArtistStub("Artist");
    expect(stub.address).toEqual({
      country: "",
      city: "",
      state: "",
      zip: "",
      address_line: "",
      countryCode: "",
      stateCode: "",
    });
  });

  it("initializes art_style as empty array", () => {
    expect(generateGhostArtistStub("Artist").art_style).toEqual([]);
  });

  it("sets logo to empty string", () => {
    expect(generateGhostArtistStub("Artist").logo).toBe("");
  });

  it("sets bio to empty string", () => {
    expect(generateGhostArtistStub("Artist").bio).toBe("");
  });
});
