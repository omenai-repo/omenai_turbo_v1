export const allKeysEmpty = (obj: Record<string, any>): boolean => {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (value === "" || value === null || value === undefined) {
        return true; // Found a key with an empty string, null, or undefined value
      }
    }
  }
  return false; // All keys have valid values
};
