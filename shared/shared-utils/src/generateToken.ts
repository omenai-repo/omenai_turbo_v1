// program to generate random strings

import cryptoRandomString from "crypto-random-string";

export const generateDigit = (length: number) => {
  const token = cryptoRandomString({ length, type: "numeric" });

  return token;
};
export const generateAlphaDigit = (length: number) => {
  const token = cryptoRandomString({ length, type: "alphanumeric" });

  return token;
};
