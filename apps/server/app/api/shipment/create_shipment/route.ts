import { NextResponse } from "next/server";
import {
  getDhlHeaders,
  OMENAI_INC_DHL_EXPRESS_IMPORT_ACCOUNT,
  SHIPMENT_API_URL,
} from "../resources";
import { getFutureShipmentDate } from "@omenai/shared-utils/src/getFutureShipmentDate";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import {
  standardRateLimit,
  strictRateLimit,
} from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { createErrorRollbarReport, validateRequestBody } from "../../util";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import z from "zod";
const CreatePickupSchema = z.object({
  specialInstructions: z.string().optional(),
  seller_details: z.object({
    address: z.object({
      address_line: z.string(),
      city: z.string(),
      country: z.string(),
      countryCode: z.string(),
      state: z.string(),
      stateCode: z.string(),
      zip: z.string(),
    }),
    email: z.string(),
    phone: z.string(),
    fullname: z.string(),
  }),
  shipment_product_code: z.string(),
  dimensions: z.object({
    length: z.number(),
    width: z.number(),
    height: z.number(),
    weight: z.number(),
  }),
  receiver_address: z.object({
    address_line: z.string(),
    city: z.string(),
    country: z.string(),
    countryCode: z.string(),
    state: z.string(),
    stateCode: z.string(),
    zip: z.string(),
  }),
  receiver_data: z.object({
    email: z.string(),
    phone: z.string(),
    fullname: z.string(),
  }),
  invoice_number: z.string(),
  artwork_name: z.string(),
  artwork_price: z.number(),
});
export const POST = withRateLimit(standardRateLimit)(async function POST(
  request: Request,
) {
  try {
    const {
      specialInstructions,
      seller_details,
      shipment_product_code,
      dimensions,
      receiver_address,
      receiver_data,
      invoice_number,
      artwork_name,
      artwork_price,
    } = await validateRequestBody(request, CreatePickupSchema);

    const [plannedShippingDateAndTime, invoiceDate] = await Promise.all([
      getFutureShipmentDate(3, true, seller_details.address.countryCode, {
        hours: "12",
        minutes: "00",
      }),
      getFutureShipmentDate(0, false, seller_details.address.countryCode),
    ]);

    const account_to_use =
      seller_details.address.countryCode === receiver_address.countryCode
        ? OMENAI_INC_DHL_EXPRESS_IMPORT_ACCOUNT
        : OMENAI_INC_DHL_EXPRESS_IMPORT_ACCOUNT;

    const shipmentPayloadData = {
      plannedShippingDateAndTime,
      productCode: shipment_product_code,
      localProductCode: shipment_product_code,

      customerReferences: [
        {
          typeCode: "CU",
          value: invoice_number,
        },
      ],

      pickup: {
        isRequested: true,
        closeTime: "18:00",
        location: "residence",
        specialInstructions: [
          {
            value: `${specialInstructions?.substring(0, 80)}`,
          },
        ],
        pickupDetails: {
          postalAddress: {
            postalCode: seller_details.address.zip,
            cityName: seller_details.address.city,
            countryCode: seller_details.address.countryCode,
            addressLine1: seller_details.address.address_line,
            provinceCode: seller_details.address.stateCode,
          },
          contactInformation: {
            email: seller_details.email,
            phone: seller_details.phone,
            companyName: "OMENAI INC",
            fullName: seller_details.fullname,
          },
          typeCode: "business",
        },
      },

      accounts: [
        {
          typeCode: "shipper",
          number: account_to_use,
        },
        {
          typeCode: "payer",
          number: account_to_use,
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
            postalCode: process.env.DHL_SHIPPER_POSTAL_CODE as string,
            cityName: process.env.DHL_SHIPPER_STATE as string,
            countryCode: process.env.DHL_SHIPPER_COUNTRY as string,
            addressLine1: process.env.DHL_SHIPPER_ADDRESS as string,
            countryName: "UNITED STATES OF AMERICA",
            provinceCode: process.env.DHL_SHIPPER_PROVINCE_CODE as string,
          },
          contactInformation: {
            email: process.env.DHL_SHIPPER_EMAIL as string,
            phone: process.env.DHL_SHIPPER_PHONE as string,
            companyName: process.env.DHL_SHIPPER_COMPANY as string,
            fullName: process.env.DHL_SHIPPER_NAME as string,
          },
          registrationNumbers: [
            { typeCode: "EIN", number: "92-2361819", issuerCountryCode: "US" },
          ],
          typeCode: "business",
        },

        receiverDetails: {
          postalAddress: {
            cityName: receiver_address.city,
            countryCode: receiver_address.countryCode,
            postalCode: receiver_address.zip,
            addressLine1: receiver_address.address_line,
            countryName: receiver_address.country,
            provinceCode: receiver_address.stateCode,
          },
          contactInformation: {
            email: receiver_data.email,
            phone: receiver_data.phone,
            companyName: "OMENAI INC",
            fullName: receiver_data.fullname,
          },
          typeCode: "business",
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
            customerReferences: [{ typeCode: "CU", value: invoice_number }],
          },
        ],

        isCustomsDeclarable:
          seller_details.address.countryCode !== receiver_address.countryCode,

        description: `Artpiece: ${artwork_name}`,
        declaredValue: artwork_price,
        declaredValueCurrency: "USD",
        incoterm: "DAP",
        unitOfMeasurement: "metric",

        // USFilingTypeValue:
        //   seller_details.address.countryCode === "US" &&
        //   receiver_address.countryCode !== "US" &&
        //   artwork_price > 2500
        //     ? "X20260217123456"
        //     : "FTR: 30.37(a)",

        exportDeclaration: {
          invoice: {
            number: invoice_number,
            date: invoiceDate,
          },
          lineItems: [
            {
              number: 1,
              description: `Artpiece: ${artwork_name}`,
              price: artwork_price,
              priceCurrency: "USD",

              quantity: {
                value: 1,
                unitOfMeasurement: "PCS",
              },

              commodityCodes: [
                {
                  typeCode: "outbound",
                  value: "970110",
                },
              ],

              customerReferences: [
                {
                  typeCode: "NLR",
                  value: "NLR",
                },
                {
                  typeCode: "AFE",
                  value: "EAR99",
                },
              ],

              exportReasonType: "permanent",
              manufacturerCountry: seller_details.address.countryCode,
              weight: {
                netValue: dimensions.weight,
                grossValue: dimensions.weight,
              },
            },
          ],
        },
      },

      shipmentNotification: [
        {
          typeCode: "email",
          receiverId: receiver_data.email,
          languageCode: "eng",
          languageCountryCode: "US",
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

    console.log("🚀 Creating DHL Shipment with Payload:", shipmentPayloadData);
    const requestOptions = {
      method: "POST",
      headers: getDhlHeaders(),
      body: JSON.stringify(shipmentPayloadData),
    };

    const response = await fetch(`${SHIPMENT_API_URL}`, requestOptions);
    const data = await response.json();

    console.log(data);

    if (!response.ok)
      throw new ServerError("Error creating shipment. Please contact support");

    return NextResponse.json(
      { message: "Success", data: { ...data, plannedShippingDateAndTime } },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "shipment: create shipment",
      error,
      error_response.status,
    );
    return NextResponse.json(
      {
        message: "Error occured while creating shipment, contact support",
        error,
      },
      { status: 500 },
    );
  }
});
