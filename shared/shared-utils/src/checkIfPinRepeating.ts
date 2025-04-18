export function isRepeatingOrConsecutive(pin: string): boolean {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error("PIN must be a 4-digit number string");
  }

  // Check for repeating digits
  if (/^(\d)\1{3}$/.test(pin)) {
    return true;
  }

  // Convert each digit to a number
  const digits = pin.split("").map(Number);

  // Check ascending consecutive (e.g., 1234)
  const isAscending = digits.every(
    (digit, i) => i === 0 || digit === digits[i - 1] + 1
  );

  // Check descending consecutive (e.g., 4321)
  const isDescending = digits.every(
    (digit, i) => i === 0 || digit === digits[i - 1] - 1
  );

  return isAscending || isDescending;
}
