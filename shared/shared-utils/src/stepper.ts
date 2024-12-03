export const displayStepperComponent = (
  index: number,
  stepperComponentIndex: number
) => {
  if (index === stepperComponentIndex) {
    return true;
  }

  return false;
};
