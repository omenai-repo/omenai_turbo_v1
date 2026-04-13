export const ValidationUtils = {
  /**
   * Validates a UK Account Number and Sort Code
   */
  isValidUKBankDetails: (accountNumber: string, sortCode: string): boolean => {
    // Remove dashes or spaces from sort code
    const cleanSortCode = sortCode.replace(/[\s-]/g, "");
    const cleanAccountNumber = accountNumber.replace(/\s/g, "");

    const isValidSortCode = /^[0-9]{6}$/.test(cleanSortCode);
    const isValidAccount = /^[0-9]{8}$/.test(cleanAccountNumber);

    return isValidSortCode && isValidAccount;
  },

  /**
   * Validates an International Bank Account Number (IBAN) using the Modulo 97 checksum
   */
  isValidIBAN: (iban: string): boolean => {
    // 1. Remove spaces and uppercase it
    const cleanIban = iban.replace(/\s/g, "").toUpperCase();

    // 2. Check basic regex (2 letters, 2 digits, then alphanumeric up to 34 chars)
    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,30}$/.test(cleanIban)) {
      return false;
    }

    // 3. Move the first 4 characters to the end
    const rearranged = cleanIban.substring(4) + cleanIban.substring(0, 4);

    // 4. Convert letters to numbers (A = 10, B = 11, ... Z = 35)
    const numericString = rearranged
      .split("")
      .map((char) => {
        const code = char.charCodeAt(0);
        // If it's a letter (A-Z)
        if (code >= 65 && code <= 90) {
          return (code - 55).toString(); // 'A' (65) becomes 10
        }
        return char; // Keep numbers as they are
      })
      .join("");

    // 5. Perform Modulo 97 operation on the large string
    // Because the number is too large for standard JS math, we chunk it
    let checksum = numericString.slice(0, 2);
    for (let offset = 2; offset < numericString.length; offset += 7) {
      const slice = checksum + numericString.substring(offset, offset + 7);
      checksum = (parseInt(slice, 10) % 97).toString();
    }

    return parseInt(checksum, 10) === 1;
  },
};
