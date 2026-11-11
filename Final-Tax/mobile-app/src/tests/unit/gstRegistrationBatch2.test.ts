/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";

import { GstValidators } from "../../modules/gst/utils/gstValidators";

// ===============================================================================================
// Finsolz GST Registration — Batch 2 Unit & Regression Tests
// BUG-GST-REG-003: Legal Name as per PAN
// BUG-GST-REG-004: City Validation
// BUG-GST-REG-005: District Validation
// ===============================================================================================

// -----------------------------------------------------------------------------------------------
// BUG-GST-REG-003: Legal Name of Business (as per PAN)
// -----------------------------------------------------------------------------------------------

test("BUG-GST-REG-003: Legal Name as per PAN rejects empty and whitespace-only input", () => {
  const emptyCases = ["", "   ", "\t", "\n"];
  emptyCases.forEach((val) => {
    assert.equal(GstValidators.isValidPanLegalName(val), false);
    assert.equal(GstValidators.validateBusinessField("legalName", val), "Legal Name is required");
  });
});

test("BUG-GST-REG-003: Legal Name as per PAN rejects single-character inputs", () => {
  const singleChars = ["A", "Z", "1", "9", "a"];
  singleChars.forEach((val) => {
    assert.equal(GstValidators.isValidPanLegalName(val), false);
    assert.equal(GstValidators.validateBusinessField("legalName", val), "Legal Name must be at least 2 characters");
  });
});

test("BUG-GST-REG-003: Legal Name as per PAN rejects numeric digits anywhere in the name", () => {
  const numericCases = [
    "ABC 123",
    "3M India Limited",
    "L1 Technologies",
    "Studio 54 LLP",
    "12345",
    "999999",
    "000000",
  ];
  numericCases.forEach((val) => {
    assert.equal(GstValidators.isValidPanLegalName(val), false, `Expected false for: ${val}`);
    assert.equal(
      GstValidators.validateBusinessField("legalName", val),
      "Legal Name cannot contain numbers",
      `Expected error for: ${val}`
    );
  });
});

test("BUG-GST-REG-003: Legal Name as per PAN enforces 100-character maximum", () => {
  const valid100 = "A".repeat(100);
  const invalid101 = "A".repeat(101);

  assert.equal(GstValidators.isValidPanLegalName(valid100), true);
  assert.equal(GstValidators.validateBusinessField("legalName", valid100), "");

  assert.equal(GstValidators.isValidPanLegalName(invalid101), false);
  assert.equal(GstValidators.validateBusinessField("legalName", invalid101), "Legal Name cannot exceed 100 characters");
});

test("BUG-GST-REG-003: Legal Name as per PAN preserves legitimate alphabetic, Indic, and punctuated names", () => {
  const validNames = [
    "BHARGAVI GAVINI",
    "GAVINI BHARGAVI",
    "Ravi Kumar",
    "O'Connor",
    "Anne-Marie",
    "భార్గవి గావిని",
    "Café Coffee Day",
    "भारत Enterprises",
    "Apex Tech Solutions Pvt. Ltd.",
    "HP",
    "EY",
  ];

  validNames.forEach((name) => {
    assert.equal(GstValidators.isValidPanLegalName(name), true, `Expected valid: ${name}`);
    assert.equal(GstValidators.validateBusinessField("legalName", name), "", `Expected no error: ${name}`);
  });
});

test("BUG-GST-REG-003: Legal Name as per PAN rejects emojis, invalid symbols, and bad whitespace", () => {
  const invalidCases = [
    "Bhargavi 😊",
    "Acme @ Corp",
    "Acme #Corp",
    "Bhargavi  Gavini",
    " Bhargavi",
    "Bhargavi ",
  ];

  invalidCases.forEach((val) => {
    assert.equal(GstValidators.isValidPanLegalName(val), false, `Expected invalid: ${val}`);
    assert.equal(GstValidators.validateBusinessField("legalName", val), "Enter a valid legal business name");
  });
});

// -----------------------------------------------------------------------------------------------
// BUG-GST-REG-004: City Validation
// -----------------------------------------------------------------------------------------------

test("BUG-GST-REG-004: City rejects empty and whitespace-only input", () => {
  const emptyCases = ["", "   ", "\t", "\n"];
  emptyCases.forEach((val) => {
    assert.equal(GstValidators.isValidLocationName(val), false);
    assert.equal(GstValidators.validateBusinessField("city", val), "City is required");
  });
});

test("BUG-GST-REG-004: City rejects single-character input with specific message", () => {
  const singleChars = ["A", "Z", "1", "9", "a"];
  singleChars.forEach((val) => {
    assert.equal(GstValidators.isValidLocationName(val), false);
    assert.equal(GstValidators.validateBusinessField("city", val), "City must be at least 2 characters");
  });
});

test("BUG-GST-REG-004: City rejects numeric-only and mixed numeric values anywhere in input", () => {
  const numericCases = [
    "12", "123", "3734", "560001", "99999", "00000",
    "1Mumbai", "9Bengaluru",
    "Mum1bai", "New 24 Delhi",
    "Mumbai1", "Hyderabad0",
    "मुंबई१", "హైదరాబాద్౧",
  ];
  numericCases.forEach((val) => {
    assert.equal(GstValidators.isValidCity(val), false);
    assert.equal(GstValidators.isValidLocationName(val), false);
    assert.equal(GstValidators.validateCity(val), "City cannot contain numbers");
    assert.equal(GstValidators.validateBusinessField("city", val), "City cannot contain numbers");
  });
});

test("BUG-GST-REG-004: City enforces 50-character maximum length", () => {
  const valid50 = "A".repeat(50);
  const invalid51 = "A".repeat(51);

  assert.equal(GstValidators.isValidCity(valid50), true);
  assert.equal(GstValidators.isValidLocationName(valid50), true);
  assert.equal(GstValidators.validateCity(valid50), "");
  assert.equal(GstValidators.validateBusinessField("city", valid50), "");

  assert.equal(GstValidators.isValidCity(invalid51), false);
  assert.equal(GstValidators.isValidLocationName(invalid51), false);
  assert.equal(GstValidators.validateCity(invalid51), "City cannot exceed 50 characters");
  assert.equal(GstValidators.validateBusinessField("city", invalid51), "City cannot exceed 50 characters");
});

test("BUG-GST-REG-004: City preserves legitimate Indian, multiword, and Unicode city names", () => {
  const validCities = [
    "Hyderabad",
    "Bengaluru",
    "New Delhi",
    "Navi Mumbai",
    "Hitech City",
    "मुंबई",
    "तिरुचिरापल्ली",
    "హైదరాబాద్",
    "విశాఖపట్నం",
    "విజయవాడ",
    "గుంటూరు",
    "వరంగల్",
  ];

  validCities.forEach((city) => {
    assert.equal(GstValidators.isValidCity(city), true, `Expected valid city: ${city}`);
    assert.equal(GstValidators.isValidLocationName(city), true, `Expected valid city: ${city}`);
    assert.equal(GstValidators.validateCity(city), "", `Expected no error for city: ${city}`);
    assert.equal(GstValidators.validateBusinessField("city", city), "", `Expected no error for city: ${city}`);
  });
});

test("BUG-GST-REG-004: City rejects emojis, punctuation, special symbols, repeated whitespace, and whitespace boundaries", () => {
  const invalidCases = [
    "St. Thomas Mount",
    "O'Valley",
    "Bengaluru 🥰",
    "City @@@###",
    "City $%^&",
    "New  Delhi",
    " Bengaluru",
    "Bengaluru ",
    "New\tDelhi",
    "New\nDelhi",
  ];

  invalidCases.forEach((val) => {
    assert.equal(GstValidators.isValidCity(val), false, `Expected invalid city: ${val}`);
    assert.equal(GstValidators.isValidLocationName(val), false, `Expected invalid city: ${val}`);
    assert.equal(GstValidators.validateCity(val), "Enter a valid city name");
    assert.equal(GstValidators.validateBusinessField("city", val), "Enter a valid city name");
  });
});

// -----------------------------------------------------------------------------------------------
// BUG-GST-REG-005: District Validation
// -----------------------------------------------------------------------------------------------

test("BUG-GST-REG-005: District rejects empty and whitespace-only input", () => {
  const emptyCases = ["", "   ", "\t", "\n"];
  emptyCases.forEach((val) => {
    assert.equal(GstValidators.isValidDistrict(val), false);
    assert.equal(GstValidators.isValidLocationName(val), false);
    assert.equal(GstValidators.validateDistrict(val), "District is required");
    assert.equal(GstValidators.validateBusinessField("district", val), "District is required");
  });
});

test("BUG-GST-REG-005: District rejects single-character input with specific message", () => {
  const singleChars = ["A", "Z", "1", "9", "a"];
  singleChars.forEach((val) => {
    assert.equal(GstValidators.isValidDistrict(val), false);
    assert.equal(GstValidators.isValidLocationName(val), false);
    assert.equal(GstValidators.validateDistrict(val), "District must be at least 2 characters");
    assert.equal(GstValidators.validateBusinessField("district", val), "District must be at least 2 characters");
  });
});

test("BUG-GST-REG-005: District rejects numeric-only and mixed numeric values anywhere in input", () => {
  const numericCases = [
    "12", "123", "35483", "560001", "99999", "00000",
    "1Pune", "2Thane",
    "South 24 Parganas", "North 24 Parganas", "Dist1rict",
    "Pune1", "Thane2",
    "पुणे१", "కృష్ణా౨",
  ];
  numericCases.forEach((val) => {
    assert.equal(GstValidators.isValidDistrict(val), false);
    assert.equal(GstValidators.isValidLocationName(val), false);
    assert.equal(GstValidators.validateDistrict(val), "District cannot contain numbers");
    assert.equal(GstValidators.validateBusinessField("district", val), "District cannot contain numbers");
  });
});

test("BUG-GST-REG-005: District enforces 50-character maximum length", () => {
  const valid50 = "A".repeat(50);
  const invalid51 = "A".repeat(51);

  assert.equal(GstValidators.isValidDistrict(valid50), true);
  assert.equal(GstValidators.isValidLocationName(valid50), true);
  assert.equal(GstValidators.validateDistrict(valid50), "");
  assert.equal(GstValidators.validateBusinessField("district", valid50), "");

  assert.equal(GstValidators.isValidDistrict(invalid51), false);
  assert.equal(GstValidators.isValidLocationName(invalid51), false);
  assert.equal(GstValidators.validateDistrict(invalid51), "District cannot exceed 50 characters");
  assert.equal(GstValidators.validateBusinessField("district", invalid51), "District cannot exceed 50 characters");
});

test("BUG-GST-REG-005: District preserves legitimate multiword and Unicode district names", () => {
  const validDistricts = [
    "Bengaluru Urban",
    "Bengaluru Rural",
    "Gautam Buddha Nagar",
    "South Twenty Four Parganas",
    "North Twenty Four Parganas",
    "वाराणसी",
    "Pune",
    "విశాఖపట్నం",
    "రంగారెడ్డి",
    "కృష్ణా",
  ];

  validDistricts.forEach((district) => {
    assert.equal(GstValidators.isValidDistrict(district), true, `Expected valid district: ${district}`);
    assert.equal(GstValidators.isValidLocationName(district), true, `Expected valid district: ${district}`);
    assert.equal(GstValidators.validateDistrict(district), "", `Expected no error for district: ${district}`);
    assert.equal(GstValidators.validateBusinessField("district", district), "", `Expected no error for district: ${district}`);
  });
});

test("BUG-GST-REG-005: District rejects emojis, punctuation, special symbols, repeated whitespace, and whitespace boundaries", () => {
  const invalidCases = [
    "Leh-Ladakh",
    "O'Valley",
    "Pune 🥰",
    "District @#$%^&",
    "District @@@###",
    "Bengaluru  Urban",
    " Pune",
    "Pune ",
    "Pune\tRural",
    "Pune\nRural",
  ];

  invalidCases.forEach((val) => {
    assert.equal(GstValidators.isValidDistrict(val), false, `Expected invalid district: ${val}`);
    assert.equal(GstValidators.isValidLocationName(val), false, `Expected invalid district: ${val}`);
    assert.equal(GstValidators.validateDistrict(val), "Enter a valid district name");
    assert.equal(GstValidators.validateBusinessField("district", val), "Enter a valid district name");
  });
});

// -----------------------------------------------------------------------------------------------
// Whole-Form Integration & Progression Consistency
// -----------------------------------------------------------------------------------------------

test("validateBusinessForm enforces City, District, and Legal Name consistently", () => {
  const baseForm: Record<string, string> = {
    legalName: "Bhargavi Enterprises",
    businessName: "3M India",
    businessType: "Private Limited",
    natureOfBusiness: "Retail",
    placeOfBusiness: "Owned",
    businessStartDate: "15-01-2024",
    reasonForRegistration: "Voluntary",
    compositionScheme: "No",
    businessAddress: "123 MG Road",
    city: "Bengaluru",
    district: "Bengaluru Urban",
    state: "Karnataka",
    pinCode: "560001",
    hsnCode: "998311",
    accountHolderName: "Bhargavi Rao",
    bankAccountNumber: "123456789012",
    confirmBankAccountNumber: "123456789012",
    ifscCode: "HDFC0001234",
    bankName: "HDFC Bank",
    branchName: "Indiranagar",
    accountType: "Current",
    signatoryName: "Bhargavi Rao",
    signatoryPan: "ABCPE1234F",
    signatoryDob: "12-05-1990",
    signatoryDesignation: "Director",
    signatoryMobile: "9876543210",
    signatoryEmail: "bhargavi@gmail.com",
    aadhaarConsent: "true",
  };

  // Valid complete form passes with 0 errors
  const validErrors = GstValidators.validateBusinessForm(baseForm);
  assert.deepEqual(validErrors, {});

  // Form with valid multiword district passes
  const wbForm = { ...baseForm, city: "Kolkata", district: "South Twenty Four Parganas", state: "West Bengal" };
  assert.deepEqual(GstValidators.validateBusinessForm(wbForm), {});

  // Rejects numeric-only City
  const numericCityErrors = GstValidators.validateBusinessForm({ ...baseForm, city: "560001" });
  assert.equal(numericCityErrors.city, "City cannot contain numbers");

  // Rejects numeric-only District
  const numericDistrictErrors = GstValidators.validateBusinessForm({ ...baseForm, district: "35483" });
  assert.equal(numericDistrictErrors.district, "District cannot contain numbers");

  // Rejects mixed numeric City
  const mixedCityErrors = GstValidators.validateBusinessForm({ ...baseForm, city: "City 123" });
  assert.equal(mixedCityErrors.city, "City cannot contain numbers");

  // Rejects mixed numeric District
  const mixedDistrictErrors = GstValidators.validateBusinessForm({ ...baseForm, district: "South 24 Parganas" });
  assert.equal(mixedDistrictErrors.district, "District cannot contain numbers");

  // Rejects punctuation/symbols in City
  const symbolCityErrors = GstValidators.validateBusinessForm({ ...baseForm, city: "St. Thomas" });
  assert.equal(symbolCityErrors.city, "Enter a valid city name");

  // Rejects punctuation/symbols in District
  const symbolDistrictErrors = GstValidators.validateBusinessForm({ ...baseForm, district: "Leh-Ladakh" });
  assert.equal(symbolDistrictErrors.district, "Enter a valid district name");

  // Rejects single-character City
  const shortCityErrors = GstValidators.validateBusinessForm({ ...baseForm, city: "A" });
  assert.equal(shortCityErrors.city, "City must be at least 2 characters");

  // Rejects single-character District
  const shortDistrictErrors = GstValidators.validateBusinessForm({ ...baseForm, district: "A" });
  assert.equal(shortDistrictErrors.district, "District must be at least 2 characters");

  // Rejects numeric digits in Legal Name as per PAN
  const numericLegalErrors = GstValidators.validateBusinessForm({ ...baseForm, legalName: "3M India Limited" });
  assert.equal(numericLegalErrors.legalName, "Legal Name cannot contain numbers");
});
