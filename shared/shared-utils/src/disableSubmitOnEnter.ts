export const handleKeyPress = (
  e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  if (e.key === "Enter") {
    e.preventDefault();
  }
};
