export const trimWhiteSpace = (s: string) => {
  const trimmedString: string = s.replaceAll(/\s+/g, " ").trim();

  return trimmedString;
};
