// A mapping of DHL error codes to user-friendly messages
export const dhlErrorMap: { [code: string]: string } = {
  "3001": "DHL's service area for this address is currently not operational.",
  "3002":
    "Your address cannot be verified. Please check your address details and try again.",
  "3003":
    "DHL's service area for this address is currently not open for operations.",
  "3004":
    "DHL's service area for this address is currently closed for operations.",
  "3005":
    "DHL's service area for this address is currently currently not operational.",
  "3006":
    "Associated country code for provided country not found. Please contact support.",
  "3007":
    "Your address could not be verified. Please check your address details and try again.",
  "3008":
    "Postal/Zip code not found for this address. Please check your address details and try again.",
  "3009":
    "Address verification failed. Please try again or contact support if this persists.",
  "3010": "Please provide a valid address containing a city or postal code.",
  "3011":
    "DHL's Service area not available for the given address. Please choose a different address.",

  // Add additional mappings as needed
};
