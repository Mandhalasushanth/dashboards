/// <reference types="node" />
import test from "node:test";
import assert from "node:assert/strict";

import { GstValidators } from "../../modules/gst/utils/gstValidators";

// ===============================================================================================
// Finsolz GST Registration — Strict Business Address Validation Unit Tests
// ===============================================================================================

test("Business Address: rejects empty, null, undefined, and whitespace-only input", () => {
  const emptyCases = ["", "   ", "\t", "\n", " \t \n "];
  emptyCases.forEach((val) => {
    assert.equal(GstValidators.isValidBusinessAddress(val), false, `Expected invalid for: ${JSON.stringify(val)}`);
    assert.equal(GstValidators.validateBusinessAddress(val), "Business address is required");
    assert.equal(GstValidators.validateBusinessField("businessAddress", val), "Business address is required");
  });
});

test("Business Address: rejects inputs shorter than 5 characters", () => {
  const shortCases = ["H", "H.", "No.", "Plot", "#123", " 123 "];
  shortCases.forEach((val) => {
    assert.equal(GstValidators.isValidBusinessAddress(val), false, `Expected invalid for: ${JSON.stringify(val)}`);
    assert.equal(GstValidators.validateBusinessAddress(val), "Business address must be at least 5 characters");
    assert.equal(GstValidators.validateBusinessField("businessAddress", val), "Business address must be at least 5 characters");
  });
});

test("Business Address: enforces 250-character maximum length boundary", () => {
  const valid250 = "Flat 101, " + "A".repeat(240);
  assert.equal(valid250.length, 250);
  assert.equal(GstValidators.isValidBusinessAddress(valid250), true);
  assert.equal(GstValidators.validateBusinessAddress(valid250), "");
  assert.equal(GstValidators.validateBusinessField("businessAddress", valid250), "");

  const invalid251 = valid250 + "A";
  assert.equal(invalid251.length, 251);
  assert.equal(GstValidators.isValidBusinessAddress(invalid251), false);
  assert.equal(GstValidators.validateBusinessAddress(invalid251), "Business address cannot exceed 250 characters");
  assert.equal(GstValidators.validateBusinessField("businessAddress", invalid251), "Business address cannot exceed 250 characters");
});

test("Business Address: accepts legitimate Indian business addresses with standard formatting", () => {
  const validAddresses = [
    "H.No. 12-3/4, MG Road",
    "Flat #203, Sai Residency",
    "Plot No. 15, 2nd Floor",
    "D.No. 4-12, Main Road",
    "Shop 4 (Ground Floor), City Center, Road No. 2",
    "Unit 501, L&T Infocity, Software Units Layout, HITEC City",
    "A&B Complex, Plot No. 15, Industrial Estate",
    "123, Market Road, Near Gandhi Statue",
    "Survey No. 45/2, Beside HP Petrol Bunk, Ring Road",
    "Building 7A (Mindspace), Madhapur",
    "Door #1-2-3/A, 4th Cross, 5th Main, Indiranagar",
    "Office: Suite 302, Royal Towers, M.G. Road",
  ];

  validAddresses.forEach((addr) => {
    assert.equal(GstValidators.isValidBusinessAddress(addr), true, `Expected valid address: ${addr}`);
    assert.equal(GstValidators.validateBusinessAddress(addr), "", `Expected no error for: ${addr}`);
    assert.equal(GstValidators.validateBusinessField("businessAddress", addr), "", `Expected field error empty for: ${addr}`);
  });
});

test("Business Address: accepts valid Unicode addresses in Telugu, Hindi, and Indian scripts", () => {
  const indicAddresses = [
    "ప్లాట్ నెం. 12, మెయిన్ రోడ్డు, గాంధీ నగర్",
    "ఫ్లాట్ #203, సాయి రెసిడెన్సీ, ఎంజీ రోడ్డు",
    "మకాన్ నెం. 4-5/6, ఆర్టీసీ క్రాస్ రోడ్స్",
    "मकान नं. 45, गांधी मार्ग, 2री मंजिल",
    "प्लॉट नं. 15, महात्मा गांधी मार्ग, 2री मंजिल",
    "फ्लैट #203, साई रेजीडेंसी, एमजी रोड",
    "दुकान नं. 4 (ग्राउंड फ्लोर), सिटी सेंटर, रोड नं. 2",
  ];

  indicAddresses.forEach((addr) => {
    assert.equal(GstValidators.isValidBusinessAddress(addr), true, `Expected valid Indic address: ${addr}`);
    assert.equal(GstValidators.validateBusinessAddress(addr), "", `Expected no error for: ${addr}`);
    assert.equal(GstValidators.validateBusinessField("businessAddress", addr), "", `Expected field error empty for: ${addr}`);
  });
});

test("Business Address: rejects emojis anywhere in the address (start, middle, end)", () => {
  const emojiCases = [
    "🥰 Flat 101, Residency, MG Road",
    "Flat 101, 🥰 Residency, MG Road",
    "Flat 101, Residency, MG Road 🥰",
    "🏢 Plot No. 15, Industrial Area",
    "Plot No. 15 📍 Main Road",
    "Flat 203, Sai Residency 👍",
  ];

  emojiCases.forEach((addr) => {
    assert.equal(GstValidators.isValidBusinessAddress(addr), false, `Expected invalid for emoji: ${addr}`);
    assert.equal(GstValidators.validateBusinessAddress(addr), "Business address contains unsupported characters");
    assert.equal(GstValidators.validateBusinessField("businessAddress", addr), "Business address contains unsupported characters");
  });
});

test("Business Address: rejects unsupported special characters and HTML/script tags", () => {
  const unsupportedCases = [
    "Office @ Cyber Towers, Hitec City",
    "Flat 101 $ Residency, MG Road",
    "Flat 101 % Residency, MG Road",
    "Flat 101 ^ Residency, MG Road",
    "Plot * 101, Industrial Area",
    "Plot = 101, Industrial Area",
    "Plot + 101, Industrial Area",
    "Flat `101` Residency, MG Road",
    "<script>alert(1)</script>",
    "<div class=\"address\">Main Road</div>",
    "Plot 101! Residency, MG Road",
    "Plot 101; Residency, MG Road",
    "Plot 101? Residency, MG Road",
    "Plot 101 | Residency, MG Road",
    "Plot 101_Residency, MG Road",
    "Plot 101 ~ Residency, MG Road",
    "Plot 101 [Block A] Residency",
    "Plot 101 {Phase 1} Residency",
  ];

  unsupportedCases.forEach((addr) => {
    assert.equal(GstValidators.isValidBusinessAddress(addr), false, `Expected invalid for: ${addr}`);
    assert.equal(GstValidators.validateBusinessAddress(addr), "Business address contains unsupported characters");
    assert.equal(GstValidators.validateBusinessField("businessAddress", addr), "Business address contains unsupported characters");
  });
});

test("Business Address: rejects repeated spaces, tabs, line breaks, and whitespace boundaries", () => {
  const formattingCases = [
    "Flat  101, Residency, MG Road", // consecutive spaces
    "Plot No. 15,   2nd Floor",       // triple spaces
    "Flat 101,\tResidency, MG Road",  // tab
    "Flat 101,\nResidency, MG Road",  // newline
    "Flat 101,\r\nResidency, MG Road",// crlf
    " Flat 101, Residency, MG Road",  // leading space
    "Flat 101, Residency, MG Road ",  // trailing space
  ];

  formattingCases.forEach((addr) => {
    assert.equal(GstValidators.isValidBusinessAddress(addr), false, `Expected invalid for: ${JSON.stringify(addr)}`);
    assert.equal(GstValidators.validateBusinessAddress(addr), "Enter a valid business address");
    assert.equal(GstValidators.validateBusinessField("businessAddress", addr), "Enter a valid business address");
  });
});

test("Business Address: rejects numeric-only and punctuation-only inputs without letters", () => {
  const nonLetterCases = [
    "12345678",
    "560001",
    "...,,,---///",
    "###,,,---...",
    "#12-34/56, 7890",
    "1234, 5678, 9012",
    "12-3/4, 5678",
  ];

  nonLetterCases.forEach((val) => {
    assert.equal(GstValidators.isValidBusinessAddress(val), false, `Expected invalid for: ${val}`);
    assert.equal(GstValidators.validateBusinessAddress(val), "Enter a valid business address");
    assert.equal(GstValidators.validateBusinessField("businessAddress", val), "Enter a valid business address");
  });
});

test("Business Address: whole-form validation blocks progression on invalid address and passes on valid", () => {
  const baseForm: Record<string, string> = {
    legalName: "Bhargavi Enterprises",
    businessName: "3M India",
    businessType: "Private Limited",
    natureOfBusiness: "Retail",
    placeOfBusiness: "Owned",
    businessStartDate: "15-01-2024",
    reasonForRegistration: "Voluntary",
    compositionScheme: "No",
    businessAddress: "123 MG Road, Bengaluru",
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

  // 1. Valid form passes
  const validErrors = GstValidators.validateBusinessForm(baseForm);
  assert.deepEqual(validErrors, {});

  // 2. Empty address blocks progression
  const emptyErrors = GstValidators.validateBusinessForm({ ...baseForm, businessAddress: "" });
  assert.equal(emptyErrors.businessAddress, "Business address is required");

  // 3. Short address (< 5 chars) blocks progression
  const shortErrors = GstValidators.validateBusinessForm({ ...baseForm, businessAddress: "H.No" });
  assert.equal(shortErrors.businessAddress, "Business address must be at least 5 characters");

  // 4. Address with emoji blocks progression
  const emojiErrors = GstValidators.validateBusinessForm({ ...baseForm, businessAddress: "Flat 101, MG Road 🥰" });
  assert.equal(emojiErrors.businessAddress, "Business address contains unsupported characters");

  // 5. Address with unsupported characters blocks progression
  const symbolErrors = GstValidators.validateBusinessForm({ ...baseForm, businessAddress: "Office @ Cyber Towers, Hitec City" });
  assert.equal(symbolErrors.businessAddress, "Business address contains unsupported characters");

  // 6. Address with repeated spaces blocks progression
  const spaceErrors = GstValidators.validateBusinessForm({ ...baseForm, businessAddress: "123  MG Road, Bengaluru" });
  assert.equal(spaceErrors.businessAddress, "Enter a valid business address");

  // 7. Address with digits only blocks progression
  const digitErrors = GstValidators.validateBusinessForm({ ...baseForm, businessAddress: "12345678" });
  assert.equal(digitErrors.businessAddress, "Enter a valid business address");

  // 8. Valid Indic address passes
  const indicFormErrors = GstValidators.validateBusinessForm({
    ...baseForm,
    businessAddress: "ప్లాట్ నెం. 12, మెయిన్ రోడ్డు, గాంధీ నగర్",
    city: "హైదరాబాద్",
    district: "రంగారెడ్డి",
  });
  assert.deepEqual(indicFormErrors, {});
});
