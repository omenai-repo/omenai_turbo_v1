type IsFieldDirty = Record<string, boolean>;

export const shouldDisableNext = (
  isFieldDirty: IsFieldDirty,
  step: number,
  steps: Record<number, string[]>
): boolean => {
  // Get all inputs for the current step
  const inputsForStep = steps[step];

  // Check if all inputs in the current step have isFieldDirty set to `true`
  return inputsForStep.some((input) => isFieldDirty[input]);
};
