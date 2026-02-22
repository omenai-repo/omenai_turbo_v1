export const testDhlShipmentPayload = {
  specialInstructions:
    "Handle with extreme care, fragile canvas artwork. Please call on arrival.",
  artwork_name: "Ethereal Echoes",
  seller_details: {
    address: {
      address_line: "15 Admiralty Way",
      city: "Lekki",
      state: "Lagos",
      zip: "101222",
      country: "Nigeria",
      countryCode: "NG",
    },
    email: "artist@omenai-example.com",
    phone: "08012345678",
    fullname: "Chidi Okafor",
  },
  receiver_address: {
    address_line: "250 Vesey Street",
    city: "New York",
    state: "NY",
    zip: "10281",
    country: "United States",
    countryCode: "US",
  },
  shipment_product_code: "P",
  dimensions: {
    length: 60,
    width: 5,
    height: 40,
    weight: 8,
    unit: "metric",
  },
  receiver_data: {
    email: "collector@gmail.com",
    phone: "+12125550198",
    fullname: "Sarah Jenkins",
  },
  invoice_number: "OMENAI-INV-7H2K9L4",
  artwork_price: 2500,
  carrier: "DHL",
};
