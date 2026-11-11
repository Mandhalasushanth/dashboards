import type { RegistrationData } from "../types/auth.types";

type RegisterInput = RegistrationData & { mobileNumber: string; passcode?: string };

/** DD-MM-YYYY → YYYY-MM-DD (Spring Boot LocalDate); other formats pass through. */
export const toBackendDob = (dob?: string): string => {
  // Format DOB from DD-MM-YYYY to YYYY-MM-DD for Spring Boot LocalDate
  let formattedDob = dob || "";
  if (formattedDob && /^\d{2}-\d{2}-\d{4}$/.test(formattedDob)) {
    const [d, m, y] = formattedDob.split("-");
    formattedDob = `${y}-${m}-${d}`;
  }
  return formattedDob;
};

/** UI customer-type label → backend CustomerType enum name. */
export const toBackendCustomerType = (customerType?: string): string => {
  // Format CustomerType string to match Spring Boot Enum
  let rawType = (customerType || "INDIVIDUAL").trim();
  const typeLower = rawType.toLowerCase();
  if (typeLower.includes("freelancer")) {
    rawType = "FREELANCER";
  } else if (
    typeLower.includes("private limited") ||
    typeLower.includes("pvt")
  ) {
    rawType = "PRIVATE_LIMITED";
  } else if (typeLower.includes("public limited")) {
    rawType = "PUBLIC_LIMITED";
  } else if (typeLower === "llp") {
    rawType = "LLP";
  } else if (typeLower.includes("partnership")) {
    rawType = "PARTNERSHIP";
  } else if (typeLower.includes("proprietorship")) {
    rawType = "PROPRIETORSHIP";
  } else if (typeLower.includes("huf")) {
    rawType = "HUF";
  } else if (typeLower.includes("aop") || typeLower.includes("boi")) {
    rawType = "AOP_BOI";
  } else if (typeLower.includes("ngo") || typeLower.includes("trust")) {
    rawType = "NGO_TRUST";
  } else if (typeLower.includes("individual")) {
    rawType = "INDIVIDUAL";
  } else {
    rawType = rawType.toUpperCase().replace(/[\s\/]+/g, "_");
  }
  return rawType;
};

/** Single-line address, built from the discrete fields when `address` is empty. */
export const formatRegistrationAddress = (data: RegisterInput): string => {
  // Format full address from discrete fields if provided
  let formattedAddress = data.address || "";
  if (!formattedAddress && data.addressLine1) {
    formattedAddress = [
      data.addressLine1,
      data.addressLine2,
      data.city,
      data.state
        ? `${data.state}${data.pincode ? " - " + data.pincode : ""}`
        : data.pincode,
    ]
      .filter(Boolean)
      .join(", ");
  }
  return formattedAddress;
};

/** Body for `POST /customer/register` (Spring Boot CustomerDto). */
export const buildRegisterPayload = (data: RegisterInput) => {
  const formattedDob = toBackendDob(data.dob);
  const rawType = toBackendCustomerType(data.customerType);
  const formattedAddress = formatRegistrationAddress(data);

  // Map payload to match Spring Boot CustomerDto format exactly
  return {
    name: data.name,
    email: data.email,
    mobileNumber: data.mobileNumber.replace(/\D/g, ""),
    aadhaar: data.aadhaar,
    pan: data.pan,
    dob: formattedDob,
    customerType: rawType,
    gender: data.gender,
    fatherSpouseName: data.fatherSpouseName,
    addressLine1: data.addressLine1,
    addressLine2: data.addressLine2,
    city: data.city,
    pincode: data.pincode,
    state: data.state,
    address: formattedAddress,
    password: data.passcode,
    pushToken: data.pushToken,
  };
};
