export const testDhlShipmentPayload = {
  specialInstructions:
    "Handle with extreme care, fragile canvas artwork. Please call on arrival.",
  artwork_name: "Hola",
  seller_details: {
    address: {
      address_line: "23 S State Avenue",
      city: "Chicago",
      state: "IL",
      zip: "60601",
      country: "United States",
      countryCode: "US",
    },
    email: "dantereus1@gmail.com",
    phone: "+2349069885063",
    fullname: "Frank Raymond",
  },
  receiver_address: {
    address_line: "21, Alashela Estate",
    city: "Lagos",
    state: "LA",
    zip: "100278",
    country: "Nigeria",
    countryCode: "NG",
  },
  shipment_product_code: "P",
  dimensions: {
    length: 66,
    width: 10.2,
    height: 10.2,
    weight: 1.4,
    unit: "metric",
  },
  receiver_data: {
    email: "moses@omenai.net",
    phone: "+25093142424",
    fullname: "Francis Bujemond",
  },
  invoice_number: "OMENAI-INV-0043617",
  artwork_price: 1070,
  carrier: "DHL",
};
