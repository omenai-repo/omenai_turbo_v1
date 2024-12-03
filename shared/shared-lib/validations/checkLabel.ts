export const checkLabel = (label: string) => {
  if (
    label === "admin" ||
    label === "address" ||
    label === "description" ||
    label === "code"
  ) {
    return "general";
  } else return label;
};
