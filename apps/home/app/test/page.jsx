"use client";
import React, { useState, useEffect } from "react";

const CreditCardForm = () => {
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + 3;

  // Form state
  const [formData, setFormData] = useState({
    cardNumber: "",
    name: "",
    expirationMonth: "",
    expirationYear: "",
    cvv: "",
  });

  // Touched state to track which fields have been interacted with
  const [touched, setTouched] = useState({
    cardNumber: false,
    name: false,
    expirationMonth: false,
    expirationYear: false,
    cvv: false,
  });

  // Error state
  const [errors, setErrors] = useState({
    cardNumber: "",
    name: "",
    expirationMonth: "",
    expirationYear: "",
    cvv: "",
  });

  const [isFormValid, setIsFormValid] = useState(false);

  // Validation functions
  const validateCardNumber = (value) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length !== 16) {
      return "Invalid Card Number";
    }
    return "";
  };

  const validateName = (value) => {
    if (!value.trim()) {
      return "Invalid Name";
    }
    if (!/^[a-zA-Z\s]+$/.test(value)) {
      return "Invalid Name";
    }
    return "";
  };

  const validateMonth = (value) => {
    const month = parseInt(value, 10);
    if (!value || value.length !== 2 || month < 1 || month > 12) {
      return "Invalid Month";
    }
    return "";
  };

  const validateYear = (value) => {
    const year = parseInt(value, 10);
    if (!value || value.length !== 4 || year < currentYear || year > maxYear) {
      return "Invalid Year";
    }
    return "";
  };

  const validateCVV = (value) => {
    if (!value || value.length !== 3 || !/^\d{3}$/.test(value)) {
      return "Invalid CVV";
    }
    return "";
  };

  // Validate all fields and update form validity
  useEffect(() => {
    const newErrors = {
      cardNumber: touched.cardNumber
        ? validateCardNumber(formData.cardNumber)
        : "",
      name: touched.name ? validateName(formData.name) : "",
      expirationMonth: touched.expirationMonth
        ? validateMonth(formData.expirationMonth)
        : "",
      expirationYear: touched.expirationYear
        ? validateYear(formData.expirationYear)
        : "",
      cvv: touched.cvv ? validateCVV(formData.cvv) : "",
    };

    setErrors(newErrors);

    // Check if all fields are touched and valid
    const allFieldsTouched = Object.values(touched).every((t) => t === true);
    const noErrors = Object.values(newErrors).every((error) => error === "");
    const allFieldsFilled = Object.values(formData).every(
      (value) => value.trim() !== ""
    );

    setIsFormValid(allFieldsTouched && noErrors && allFieldsFilled);
  }, [formData, touched, currentYear, maxYear]);

  // Handle input changes
  const handleChange = (field) => (e) => {
    let value = e.target.value;

    // Apply formatting/restrictions based on field
    switch (field) {
      case "cardNumber":
        value = value.replace(/\D/g, "").slice(0, 16);
        break;
      case "name":
        // Allow letters and spaces only
        value = value.replace(/[^a-zA-Z\s]/g, "");
        break;
      case "expirationMonth":
        value = value.replace(/\D/g, "").slice(0, 2);
        break;
      case "expirationYear":
        value = value.replace(/\D/g, "").slice(0, 4);
        break;
      case "cvv":
        value = value.replace(/\D/g, "").slice(0, 3);
        break;
      default:
        break;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle blur events
  const handleBlur = (field) => () => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  // Format card number for display
  const formatCardDisplay = (value) => {
    const digits = value.replace(/\D/g, "");
    const groups = digits.match(/.{1,4}/g) || [];
    return groups.join(" ");
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(touched).reduce(
      (acc, key) => ({
        ...acc,
        [key]: true,
      }),
      {}
    );
    setTouched(allTouched);

    if (isFormValid) {
      console.log("Form submitted successfully:", formData);
      // Process payment here
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Payment Information
          </h2>

          <div className="space-y-6">
            {/* Card Number */}
            <div>
              <label
                htmlFor="cardNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Card Number
              </label>
              <input
                type="text"
                id="cardNumber"
                value={formatCardDisplay(formData.cardNumber)}
                onChange={handleChange("cardNumber")}
                onBlur={handleBlur("cardNumber")}
                placeholder="1234 5678 9012 3456"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.cardNumber && touched.cardNumber
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                required
              />
              {errors.cardNumber && touched.cardNumber && (
                <p
                  data-test-id="numberInputError"
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.cardNumber}
                </p>
              )}
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cardholder Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange("name")}
                onBlur={handleBlur("name")}
                placeholder="John Doe"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name && touched.name
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                required
              />
              {errors.name && touched.name && (
                <p
                  data-test-id="nameInputError"
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.name}
                </p>
              )}
            </div>

            {/* Expiration Date and CVV Row */}
            <div className="grid grid-cols-3 gap-4">
              {/* Expiration Month */}
              <div>
                <label
                  htmlFor="expirationMonth"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Month
                </label>
                <input
                  type="text"
                  id="expirationMonth"
                  value={formData.expirationMonth}
                  onChange={handleChange("expirationMonth")}
                  onBlur={handleBlur("expirationMonth")}
                  placeholder="MM"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.expirationMonth && touched.expirationMonth
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  required
                />
                {errors.expirationMonth && touched.expirationMonth && (
                  <p
                    data-test-id="monthInputError"
                    className="mt-1 text-sm text-red-600"
                  >
                    {errors.expirationMonth}
                  </p>
                )}
              </div>

              {/* Expiration Year */}
              <div>
                <label
                  htmlFor="expirationYear"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Year
                </label>
                <input
                  type="text"
                  id="expirationYear"
                  value={formData.expirationYear}
                  onChange={handleChange("expirationYear")}
                  onBlur={handleBlur("expirationYear")}
                  placeholder="YYYY"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.expirationYear && touched.expirationYear
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  required
                />
                {errors.expirationYear && touched.expirationYear && (
                  <p
                    data-test-id="yearInputError"
                    className="mt-1 text-sm text-red-600"
                  >
                    {errors.expirationYear}
                  </p>
                )}
              </div>

              {/* CVV */}
              <div>
                <label
                  htmlFor="cvv"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  CVV
                </label>
                <input
                  type="text"
                  id="cvv"
                  value={formData.cvv}
                  onChange={handleChange("cvv")}
                  onBlur={handleBlur("cvv")}
                  placeholder="123"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.cvv && touched.cvv
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  required
                />
                {errors.cvv && touched.cvv && (
                  <p
                    data-test-id="cvvInputError"
                    className="mt-1 text-sm text-red-600"
                  >
                    {errors.cvv}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid}
              className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                isFormValid
                  ? "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Submit Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCardForm;
