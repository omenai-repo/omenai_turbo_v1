import { NextRequest, NextResponse } from "next/server";
import { HEADERS, OMENAI_INC_DHL_EXPRESS_IMPORT_ACCOUNT } from "../resources";
import { ShipmentRequestDataTypes } from "@omenai/shared-types";
import { getFutureShipmentDate } from "@omenai/shared-utils/src/getFutureShipmentDate";

export async function POST(request: NextRequest) {
  const {
    specialInstructions,
    seller_details,
    shipment_product_code,
    dimensions,
    receiver_address,
    receiver_data,
    invoice_number,
    artwork_name,
  }: ShipmentRequestDataTypes = await request.json();
  if (
    !seller_details ||
    !shipment_product_code ||
    !dimensions ||
    !receiver_address ||
    !receiver_data ||
    !invoice_number ||
    !artwork_name
  ) {
    return NextResponse.json(
      {
        status: "error",
        message: "Missing one or more required fields",
      },
      { status: 400 }
    );
  }

  const plannedShippingDateAndTime = await getFutureShipmentDate(
    3,
    true,
    seller_details.address.countryCode,
    {
      hours: "12",
      minutes: "00",
    }
  );

  const invoiceDate = await getFutureShipmentDate(
    0,
    false,
    seller_details.address.countryCode
  );

  const shipmentPayloadData = {
    plannedShippingDateAndTime,
    productCode: shipment_product_code,
    localProductCode: shipment_product_code,
    pickup: {
      isRequested: true,
      closeTime: "18:00",
      location: "residence",
      specialInstructions: [
        {
          value: specialInstructions || "No special instructions",
        },
      ],
      pickupDetails: {
        postalAddress: {
          postalCode: seller_details.address.zip,
          cityName: seller_details.address.city,
          countryCode: seller_details.address.countryCode,
          addressLine1: seller_details.address.address_line,
        },
        contactInformation: {
          email: seller_details.email,
          phone: seller_details.phone,
          companyName: "OMENAI INC",
          fullName: seller_details.fullname,
        },
      },
    },

    accounts: [
      {
        typeCode: "shipper",
        number: OMENAI_INC_DHL_EXPRESS_IMPORT_ACCOUNT,
      },
      {
        typeCode: "payer",
        number: OMENAI_INC_DHL_EXPRESS_IMPORT_ACCOUNT,
      },
    ],

    outputImageProperties: {
      printerDPI: 300,
      encodingFormat: "pdf",
      imageOptions: [
        {
          typeCode: "invoice",
          templateName: "COMMERCIAL_INVOICE_P_10",
          isRequested: true,
          invoiceType: "commercial",
          languageCode: "eng",
          languageCountryCode: "US",
        },
        {
          typeCode: "waybillDoc",
          templateName: "ARCH_8x4",
          isRequested: true,
          hideAccountNumber: false,
          numberOfCopies: 1,
        },
        {
          typeCode: "label",
          templateName: "ECOM26_84_001",
          renderDHLLogo: true,
          fitLabelsToA4: false,
        },
      ],
      splitTransportAndWaybillDocLabels: false,
      allDocumentsInOneImage: true,
      splitDocumentsByPages: true,
      splitInvoiceAndReceipt: false,
      receiptAndLabelsInOneImage: true,
    },
    customerDetails: {
      shipperDetails: {
        postalAddress: {
          postalCode: seller_details.address.zip,
          cityName: seller_details.address.city,
          countryCode: seller_details.address.countryCode,
          addressLine1: seller_details.address.address_line,
        },
        contactInformation: {
          email: seller_details.email,
          phone: seller_details.phone,
          companyName: "OMENAI INC",
          fullName: seller_details.fullname,
        },
      },
      receiverDetails: {
        postalAddress: {
          cityName: receiver_address.city,
          countryCode: receiver_address.countryCode,
          postalCode: receiver_address.zip,
          addressLine1: receiver_address.address_line,
          countryName: receiver_address.country,
        },
        contactInformation: {
          email: receiver_data.email,
          phone: receiver_data.phone,
          companyName: "OMENAI INC",
          fullName: receiver_data.fullname,
        },
      },
    },
    content: {
      packages: [
        {
          weight: dimensions.weight,
          dimensions: {
            length: dimensions.length,
            width: dimensions.width,
            height: dimensions.height,
          },

          description: `Artpiece: ${artwork_name}`,
        },
      ],
      isCustomsDeclarable:
        seller_details.address.countryCode !== receiver_address.countryCode,
      declaredValue: 200,
      declaredValueCurrency: "USD",
      exportDeclaration: {
        lineItems: [
          {
            number: 1,
            description: `Artpiece: ${artwork_name}`,
            price: 200,
            quantity: {
              value: 1,
              unitOfMeasurement: "BOX",
            },

            exportReasonType: "permanent",
            manufacturerCountry: seller_details.address.countryCode,
            weight: {
              netValue: dimensions.weight,
              grossValue: dimensions.weight,
            },
            isTaxesPaid: true,
          },
        ],
        invoice: {
          number: invoice_number,
          date: invoiceDate,
        },
      },
      description: `Artpiece: ${artwork_name}`,
      incoterm: "DAP",
      unitOfMeasurement: "metric",
    },
    shipmentNotification: [
      {
        typeCode: "email",
        receiverId: receiver_data.email,
        languageCode: "eng",
        languageCountryCode: "UK",
        bespokeMessage:
          "Shipment notification for your artwork purchased on Omenai",
      },
    ],
    getTransliteratedResponse: false,
    estimatedDeliveryDate: {
      isRequested: true,
      typeCode: "QDDC",
    },
  };

  try {
    const requestOptions = {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(shipmentPayloadData),
    };

    const response = await fetch(
      `https://express.api.dhl.com/mydhlapi/test/shipments`,
      requestOptions
    );
    const data = await response.json();
    return NextResponse.json({ message: "Success", data }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}
