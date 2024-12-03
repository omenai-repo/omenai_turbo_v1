export const getCardType = (cardNumber: string): string | null => {
  const visaRegex = /^4[0-9]{12}(?:[0-9]{3})?$/;
  const mastercardRegex = /^5[1-5][0-9]{14}$/;
  const amexRegex = /^3[47][0-9]{13}$/;
  const verveRegex = /^501800[0-9]{10,15}$/;

  if (visaRegex.test(cardNumber)) {
    return "visa";
  } else if (mastercardRegex.test(cardNumber)) {
    return "mastercard";
  } else if (amexRegex.test(cardNumber)) {
    return "amex";
  } else if (verveRegex.test(cardNumber)) return "verve";
  else {
    return null;
  }
};
