"use client";

import Load from "@omenai/shared-ui-components/components/loader/Load";
import { useQuery } from "@tanstack/react-query";
import { DownloadPDF } from "./DownloadPDF";
const payload = {
  specialInstructions: "Please ring doorbell",
  artistDetails: {
    address: {
      address_line: "No. 45, Osu Badu Crescent",
      city: "Lagos",
      country: "Nigeria",
      countryCode: "NG",
      state: "Lagos",
      zip: "100278",
    },
    email: "dantereus1@gmail.com",
    phone: "+2349069885063",
    fullname: "Moses Chukwunekwu",
  },
  receiver_address: {
    address_line: "No. 45, Osu Badu Crescent",
    city: "Kumasi",
    country: "Ghana",
    countryCode: "GH",
    state: "Ashanti Region",
    zip: "AK-302-4567",
  },
  shipment_product_code: "P",
  dimensions: {
    length: 10,
    weight: 5,
    height: 12,
    width: 5,
  },

  receiver_data: {
    email: "moses@omenai.net",
    phone: " +7733521307",
    fullname: "Jane Doe",
  },
  invoice_number: "4252525",
};
export default function page() {
  const { data: shipment, isLoading: loading } = useQuery({
    queryKey: ["create_shipment"],
    queryFn: async () => {
      const response = await fetch(
        "http://localhost:8080/api/shipment/create_shipment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost",
          },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json();

      return result;
    },
    refetchOnWindowFocus: false,
  });

  if (loading) {
    return (
      <div className="h-[90vh] w-full grid place-items-center">
        <Load />
      </div>
    );
  }
  return (
    <div className="h-[90vh] w-full grid place-items-center">
      <div className="container">
        <DownloadPDF pdfBase64={shipment.data.documents[0].content} />
      </div>
    </div>
  );
}
