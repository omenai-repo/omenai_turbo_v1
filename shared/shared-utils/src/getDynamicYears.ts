export function getDynamicYears() {
  const currentYear = new Date().getFullYear();
  const startingYear = 2025;

  // Create an array with years starting from 2025
  const years = [];

  // Start from 2025 and add years until the current year
  for (let year = startingYear; year <= currentYear; year++) {
    years.push(year);
  }

  return years;
}
