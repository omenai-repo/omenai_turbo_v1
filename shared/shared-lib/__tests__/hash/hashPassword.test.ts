import { describe, it, expect } from "vitest";
import bcrypt from "bcrypt";
import { hashPassword } from "../../hash/hashPassword";

describe("hashPassword", () => {
  it("returns a string", async () => {
    const hash = await hashPassword("Secure1@");
    expect(typeof hash).toBe("string");
  });

  it("returns a bcrypt hash (starts with $2b$)", async () => {
    const hash = await hashPassword("Secure1@");
    expect(hash).toMatch(/^\$2[aby]\$/);
  });

  it("produced hash verifies correctly against the original password", async () => {
    const password = "MyStr0ng!Pass";
    const hash = await hashPassword(password);
    expect(bcrypt.compareSync(password, hash)).toBe(true);
  });

  it("produced hash does NOT verify against a different password", async () => {
    const hash = await hashPassword("Correct1@");
    expect(bcrypt.compareSync("Wrong1@", hash)).toBe(false);
  });

  it("produces a different hash on each call (salted)", async () => {
    const h1 = await hashPassword("Secure1@");
    const h2 = await hashPassword("Secure1@");
    expect(h1).not.toBe(h2);
  });
});
