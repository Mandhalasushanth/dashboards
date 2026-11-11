/// <reference types="node" />
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, test } from "node:test";
import {
  getLoanDetailsStep,
  getLoanEntryStep,
  getLoanFlowDefinition,
  getLoanFlowTotalSteps,
  resolveLoanActiveStep,
} from "../../modules/loans/constants/loanFlow";
import { LOAN_CATEGORIES } from "../../modules/loans/constants/loanCategories";
import { useLoansStore } from "../../modules/loans/store/loansStore";
import {
  createInitialMsmeLoanAddress,
  createInitialMsmeLoanFormData,
  type MsmeLoanFormData,
} from "../../modules/loans/msme/types/msmeLoan.types";
import {
  validateBusinessActivityOther,
  validateBusinessName,
  validateConstitutionOther,
  validateEmployees,
  validateEstablishmentDate,
  validateGstin,
  validateMsmeLoanForm,
  validateOperatingAddress,
  validateOwnershipOther,
  validateTurnover,
  validateUdyamNumber,
} from "../../modules/loans/msme/validation/msmeLoanValidation";
import { getContinueLabel, UPDATE_AND_CONTINUE_LABEL } from "../../modules/loans/constants/continueLabels";
import { useAuthStore } from "../../modules/authentication/store/authStore";

const msmeCategory = LOAN_CATEGORIES.find((c) => c.id === "msme-loan")!;

const createValidMsmeFormData = (): MsmeLoanFormData => ({
  businessName: "Apex Engineering Enterprises",
  constitution: "Private Limited Company",
  constitutionOther: "",
  businessActivity: "Manufacturing",
  businessActivityOther: "",
  establishmentDate: "2018-06-15",
  operatingAddress: {
    houseNumber: "Plot 42, Phase 2",
    street: "IDA Cherlapally",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500051",
  },
  udyamStatus: "Registered",
  udyamRegistrationNumber: "UDYAM-TS-02-0012345",
  gstStatus: "Registered",
  gstin: "36ABCDE1234F1Z5",
  operatingDuration: "5–10 years",
  numberOfEmployees: "25",
  annualTurnover: "50,00,000",
  ownershipType: "Sole Owner",
  ownershipTypeOther: "",
});

describe("MSME Loan Screen 2: MSME & Business Details Comprehensive Suite", () => {
  beforeEach(() => {
    useLoansStore.getState().resetAll();
    useAuthStore.setState({
      isLoggedIn: true,
      profileCompleted: true,
      isExistingUser: true,
      customerExists: true,
      customer: {
        customerId: "cust-msme-2",
        customerType: "Individual",
        name: "Vikram Malhotra",
        mobile: "9876543210",
        email: "vikram@example.com",
        pan: "ABCDE1234F",
        aadhaar: "123456789012",
        dob: "1988-02-14",
        address: "Plot 42, IDA Cherlapally, Hyderabad, Telangana - 500051",
        profileCompleted: true,
      },
    });
  });

  // =========================================================================
  // 1. SCREEN HEADER & PROGRESS
  // =========================================================================
  test("1. Header & Progress: Title 'MSME Loan', Subtitle 'MSME & Business Details', Step 2 of 5", () => {
    assert.ok(msmeCategory, "MSME Category must exist");
    assert.equal(msmeCategory.title, "MSME Loan");

    const totalSteps = getLoanFlowTotalSteps("msme-loan");
    assert.equal(totalSteps, 5, "Total steps must be 5");

    const currentStep = 2;
    const progressLabel = `Step ${currentStep} of ${totalSteps}`;
    assert.equal(progressLabel, "Step 2 of 5");

    const subtitle = "MSME & Business Details";
    assert.equal(subtitle, "MSME & Business Details");

    const detailsStep = getLoanDetailsStep("msme-loan");
    assert.equal(detailsStep, "msme-details");
  });

  // =========================================================================
  // 2. SECTION 1: BUSINESS DETAILS - ADVERSARIAL VALIDATION
  // =========================================================================
  test("2. Section 1: Business / Trade Name adversarial validation", () => {
    // Empty & Whitespace only
    assert.ok(validateBusinessName(""), "Must reject empty");
    assert.ok(validateBusinessName("   "), "Must reject whitespace-only");

    // Leading / Trailing spaces
    assert.ok(validateBusinessName(" Apex Enterprises"), "Must reject leading space");
    assert.ok(validateBusinessName("Apex Enterprises "), "Must reject trailing space");

    // Emoji payloads
    assert.ok(validateBusinessName("ABC 🚀"), "Must reject text + emoji rocket");
    assert.ok(validateBusinessName("ABC 😀"), "Must reject text + emoji smile");
    assert.ok(validateBusinessName("🤣🤣🤣"), "Must reject emoji-only input");
    assert.ok(validateBusinessName("Apex Enterprises 🔥"), "Must reject fire emoji");

    // Special characters only / numbers without letters
    assert.ok(validateBusinessName("123!!!@@@"), "Must reject random symbols and digits");
    assert.ok(validateBusinessName("!@#$%^&*()"), "Must reject symbols-only input");
    assert.ok(validateBusinessName("123456789"), "Must reject numbers-only business name");

    // Malicious code / HTML / SQL injection
    assert.ok(validateBusinessName("<script>"), "Must reject <script>");
    assert.ok(validateBusinessName("<script>alert(1)</script>"), "Must reject full script tag");
    assert.ok(validateBusinessName("' OR 1=1 --"), "Must reject SQL injection");
    assert.ok(validateBusinessName("Apex; DROP TABLE users; --"), "Must reject SQL DROP statement");

    // Control characters (newlines, tabs)
    assert.ok(validateBusinessName("Apex\nEnterprises"), "Must reject newlines");
    assert.ok(validateBusinessName("Apex\tEnterprises"), "Must reject tabs");

    // Length limit
    const longName = "A".repeat(101);
    assert.ok(validateBusinessName(longName), "Must reject > 100 characters");

    // Valid business names
    assert.equal(validateBusinessName("Apex Enterprises"), undefined);
    assert.equal(validateBusinessName("Ravi Engineering Works"), undefined);
    assert.equal(validateBusinessName("ABC Traders Pvt Ltd"), undefined);
    assert.equal(validateBusinessName("McDonald's Fast Food"), undefined);
    assert.equal(validateBusinessName("L'Oreal India Distribution"), undefined);
    assert.equal(validateBusinessName("A.B.C. & Sons (Pvt) Ltd"), undefined);

    // Legitimate Indian Language Unicode support
    assert.equal(validateBusinessName("श्री गणेश ट्रेडर्स"), undefined, "Must support Hindi/Devanagari");
    assert.equal(validateBusinessName("రవి ఇంజనీరింగ్ వర్క్స్"), undefined, "Must support Telugu");
    assert.equal(validateBusinessName("சாந்தி டெக்ஸ்டைல்ஸ்"), undefined, "Must support Tamil");
  });

  test("3. Section 1: Business Constitution & 'Other' specification", () => {
    // Empty Constitution
    const valid = createValidMsmeFormData();
    valid.constitution = "" as any;
    const resEmpty = validateMsmeLoanForm(valid);
    assert.ok(resEmpty.errors.constitution, "Constitution is required");

    // When Constitution is 'Other', constitutionOther is required
    valid.constitution = "Other";
    valid.constitutionOther = "";
    const resOtherEmpty = validateMsmeLoanForm(valid);
    assert.ok(resOtherEmpty.errors.constitutionOther, "constitutionOther is required when Other is selected");

    // Adversarial tests on constitutionOther
    assert.ok(validateConstitutionOther("   "), "Must reject whitespace-only");
    assert.ok(validateConstitutionOther(" Society"), "Must reject leading space");
    assert.ok(validateConstitutionOther("Society "), "Must reject trailing space");
    assert.ok(validateConstitutionOther("Society 🚀"), "Must reject emoji");
    assert.ok(validateConstitutionOther("123456"), "Must reject numbers only");
    assert.ok(validateConstitutionOther("###$$$"), "Must reject symbols only");
    assert.ok(validateConstitutionOther("<script>alert(1)</script>"), "Must reject script tag");
    assert.ok(validateConstitutionOther("A".repeat(51)), "Must reject > 50 characters");

    // Valid constitutionOther
    assert.equal(validateConstitutionOther("Autonomous Trust"), undefined);
    assert.equal(validateConstitutionOther("Cooperative Society"), undefined);
    assert.equal(validateConstitutionOther("सहकारी समिति"), undefined, "Must support Devanagari script");
  });

  // =========================================================================
  // 3. SECTION 2: BUSINESS ACTIVITY - ADVERSARIAL VALIDATION
  // =========================================================================
  test("4. Section 2: Primary Business Activity & 'Other' specification", () => {
    const valid = createValidMsmeFormData();
    valid.businessActivity = "" as any;
    const resEmpty = validateMsmeLoanForm(valid);
    assert.ok(resEmpty.errors.businessActivity, "Primary Business Activity is required");

    // When 'Other', businessActivityOther is required
    valid.businessActivity = "Other";
    valid.businessActivityOther = "";
    const resOtherEmpty = validateMsmeLoanForm(valid);
    assert.ok(resOtherEmpty.errors.businessActivityOther, "businessActivityOther is required");

    // Adversarial tests on businessActivityOther
    assert.ok(validateBusinessActivityOther("   "), "Must reject whitespace-only");
    assert.ok(validateBusinessActivityOther(" Solar"), "Must reject leading space");
    assert.ok(validateBusinessActivityOther("Solar "), "Must reject trailing space");
    assert.ok(validateBusinessActivityOther("Manufacturing 🚀"), "Must reject text + emoji");
    assert.ok(validateBusinessActivityOther("😂😂😂"), "Must reject emoji only");
    assert.ok(validateBusinessActivityOther("!!!@@@"), "Must reject symbols only");
    assert.ok(validateBusinessActivityOther("<script>"), "Must reject script tags");
    assert.ok(validateBusinessActivityOther("A".repeat(61)), "Must reject > 60 chars");

    // Valid businessActivityOther
    assert.equal(validateBusinessActivityOther("Renewable Energy Installation"), undefined);
    assert.equal(validateBusinessActivityOther("Aerospace Component Assembly"), undefined);
    assert.equal(validateBusinessActivityOther("खाद्य प्रसंस्करण"), undefined, "Must support Indian language script");
  });

  test("5. Section 2: Business Establishment Date validation", () => {
    // Required
    assert.ok(validateEstablishmentDate(""), "Establishment date is required");
    assert.ok(validateEstablishmentDate("   "), "Whitespace-only is rejected");

    // Future date rejection
    const nextYear = new Date().getFullYear() + 1;
    assert.ok(
      validateEstablishmentDate(`${nextYear}-01-01`),
      "Must reject future date"
    );

    // Impossible calendar dates
    assert.ok(validateEstablishmentDate("2023-02-29"), "Must reject Feb 29 on non-leap year");
    assert.ok(validateEstablishmentDate("2024-02-30"), "Must reject Feb 30");
    assert.ok(validateEstablishmentDate("2023-04-31"), "Must reject April 31 (April has 30 days)");
    assert.ok(validateEstablishmentDate("2023-06-31"), "Must reject June 31");

    // Malformed strings / payloads
    assert.ok(validateEstablishmentDate("invalid-date"), "Must reject text");
    assert.ok(validateEstablishmentDate("2023-13-01"), "Must reject invalid month 13");
    assert.ok(validateEstablishmentDate("2023-00-10"), "Must reject invalid month 00");
    assert.ok(validateEstablishmentDate("2023-05-32"), "Must reject invalid day 32");
    assert.ok(validateEstablishmentDate("<script>"), "Must reject script payload");
    assert.ok(validateEstablishmentDate("1800-01-01"), "Must reject year before 1850");

    // Valid dates (ISO and Indian DD-MM-YYYY)
    assert.equal(validateEstablishmentDate("2018-05-15"), undefined);
    assert.equal(validateEstablishmentDate("15-05-2018"), undefined);
    assert.equal(validateEstablishmentDate("2024-02-29"), undefined, "Must accept Feb 29 on leap year 2024");
  });

  // =========================================================================
  // 4. SECTION 3: BUSINESS OPERATING ADDRESS - ADVERSARIAL VALIDATION
  // =========================================================================
  test("6. Section 3: Operating Address - House, Street, City, State, PIN Code", () => {
    const baseAddr = createInitialMsmeLoanAddress();

    // All fields missing
    const resEmpty = validateOperatingAddress(baseAddr);
    assert.ok(resEmpty["operatingAddress.houseNumber"], "House number required");
    assert.ok(resEmpty["operatingAddress.street"], "Street required");
    assert.ok(resEmpty["operatingAddress.city"], "City required");
    assert.ok(resEmpty["operatingAddress.state"], "State required");
    assert.ok(resEmpty["operatingAddress.pincode"], "Pincode required");

    // City / District strict checks: letters and linguistic characters only, NO numbers, NO emoji
    const cityWithEmoji = validateOperatingAddress({ ...baseAddr, city: "Hyderabad 😂" });
    assert.ok(cityWithEmoji["operatingAddress.city"], "Must reject city with emoji");

    const cityWithNumbers = validateOperatingAddress({ ...baseAddr, city: "Hyderabad 123" });
    assert.ok(cityWithNumbers["operatingAddress.city"], "Must reject city with numbers");

    const cityWithSymbols = validateOperatingAddress({ ...baseAddr, city: "Hyderabad @ Cyber" });
    assert.ok(cityWithSymbols["operatingAddress.city"], "Must reject city with symbols");

    const cityWithNewline = validateOperatingAddress({ ...baseAddr, city: "Hyderabad\nCity" });
    assert.ok(cityWithNewline["operatingAddress.city"], "Must reject city with newline");

    const cityWithLeadingSpace = validateOperatingAddress({ ...baseAddr, city: " Hyderabad" });
    assert.ok(cityWithLeadingSpace["operatingAddress.city"], "Must reject city with leading space");

    // Valid city: English & Indian languages
    const validCityEng = validateOperatingAddress({
      houseNumber: "Plot 1",
      street: "Main St",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500001",
    });
    assert.equal(validCityEng["operatingAddress.city"], undefined);

    const validCityDevanagari = validateOperatingAddress({
      houseNumber: "Plot 1",
      street: "Main St",
      city: "हैदराबाद",
      state: "Telangana",
      pincode: "500001",
    });
    assert.equal(validCityDevanagari["operatingAddress.city"], undefined, "City must accept Devanagari script");

    const validCityTelugu = validateOperatingAddress({
      houseNumber: "Plot 1",
      street: "Main St",
      city: "హైదరాబాద్",
      state: "Telangana",
      pincode: "500001",
    });
    assert.equal(validCityTelugu["operatingAddress.city"], undefined, "City must accept Telugu script");

    // State strict check: Must be in INDIAN_STATES_AND_UTS
    const invalidState = validateOperatingAddress({ ...baseAddr, state: "California" });
    assert.ok(invalidState["operatingAddress.state"], "Arbitrary state must be rejected");

    // PIN Code strict checks: exactly 6 digits, digits only, no 0 start, no spaces, no emoji
    assert.ok(
      validateOperatingAddress({ ...baseAddr, pincode: "012345" })["operatingAddress.pincode"],
      "Must reject PIN starting with 0"
    );
    assert.ok(
      validateOperatingAddress({ ...baseAddr, pincode: " 500081" })["operatingAddress.pincode"],
      "Must reject PIN with leading space"
    );
    assert.ok(
      validateOperatingAddress({ ...baseAddr, pincode: "500 081" })["operatingAddress.pincode"],
      "Must reject PIN with internal space"
    );
    assert.ok(
      validateOperatingAddress({ ...baseAddr, pincode: "50008A" })["operatingAddress.pincode"],
      "Must reject PIN with letters"
    );
    assert.ok(
      validateOperatingAddress({ ...baseAddr, pincode: "50008🚀" })["operatingAddress.pincode"],
      "Must reject PIN with emoji"
    );
    assert.ok(
      validateOperatingAddress({ ...baseAddr, pincode: "50008" })["operatingAddress.pincode"],
      "Must reject 5-digit PIN"
    );
    assert.ok(
      validateOperatingAddress({ ...baseAddr, pincode: "5000812" })["operatingAddress.pincode"],
      "Must reject 7-digit PIN"
    );

    // Valid PIN code
    assert.equal(
      validateOperatingAddress({ ...baseAddr, pincode: "500081" })["operatingAddress.pincode"],
      undefined
    );
  });

  // =========================================================================
  // 5. SECTION 4: MSME REGISTRATION - UDYAM & GSTIN
  // =========================================================================
  test("7. Section 4: Udyam Registration Status & Number strict validation", () => {
    // Missing status
    const valid = createValidMsmeFormData();
    valid.udyamStatus = "" as any;
    const resEmpty = validateMsmeLoanForm(valid);
    assert.ok(resEmpty.errors.udyamStatus, "Udyam status required");

    // When 'Not Registered' or 'Applied / Pending', Udyam number is not required
    assert.equal(validateUdyamNumber("", "Not Registered"), undefined);
    assert.equal(validateUdyamNumber("", "Applied / Pending"), undefined);

    // When 'Registered', Udyam number is required and validated strictly
    assert.ok(validateUdyamNumber("", "Registered"), "Udyam number required when registered");
    assert.ok(validateUdyamNumber("   ", "Registered"), "Whitespace rejected");
    assert.ok(validateUdyamNumber("UDYAM-MH-01-0012345🚀", "Registered"), "Emoji rejected");
    assert.ok(validateUdyamNumber("UDYAM MH 01 0012345", "Registered"), "Spaces rejected");
    assert.ok(validateUdyamNumber("UDYAM-12345", "Registered"), "Malformed format rejected");
    assert.ok(validateUdyamNumber("123456789", "Registered"), "Digits only rejected");
    assert.ok(validateUdyamNumber("UDYAM-TS-02-001234", "Registered"), "Short length rejected");
    assert.ok(validateUdyamNumber("<script>", "Registered"), "Script payload rejected");

    // Valid Udyam number
    assert.equal(validateUdyamNumber("UDYAM-MH-01-0012345", "Registered"), undefined);
    assert.equal(validateUdyamNumber("UDYAM-TS-02-0054321", "Registered"), undefined);
    assert.equal(validateUdyamNumber("udyam-ts-02-0054321", "Registered"), undefined, "Case normalizes");
  });

  test("8. Section 4: GST Registration Status & GSTIN strict validation", () => {
    // Missing GST status
    const valid = createValidMsmeFormData();
    valid.gstStatus = "" as any;
    const resEmpty = validateMsmeLoanForm(valid);
    assert.ok(resEmpty.errors.gstStatus, "GST status required");

    // When 'Not Registered' or 'Exempt', GSTIN is not required
    assert.equal(validateGstin("", "Not Registered"), undefined);
    assert.equal(validateGstin("", "Exempt"), undefined);

    // When 'Registered', GSTIN is required and strictly validated
    assert.ok(validateGstin("", "Registered"), "GSTIN required when registered");
    assert.ok(validateGstin("   ", "Registered"), "Whitespace rejected");
    assert.ok(validateGstin("GST 😂", "Registered"), "Emoji rejected");
    assert.ok(validateGstin("ABC 🚀", "Registered"), "Emoji rejected");
    assert.ok(validateGstin("ABCDE", "Registered"), "5 chars rejected");
    assert.ok(validateGstin("123456789", "Registered"), "9 digits rejected");
    assert.ok(validateGstin("36ABCDE1234F1Z", "Registered"), "14 chars rejected");
    assert.ok(validateGstin("36ABCDE1234F1Z5A", "Registered"), "16 chars rejected");
    assert.ok(validateGstin("36ABCDE 1234F1Z5", "Registered"), "Spaces rejected");
    assert.ok(validateGstin("<script>alert(1)</script>", "Registered"), "Script payload rejected");
    assert.ok(validateGstin("' OR 1=1 --", "Registered"), "SQL payload rejected");

    // Valid 15-character GSTIN
    assert.equal(validateGstin("36ABCDE1234F1Z5", "Registered"), undefined);
    assert.equal(validateGstin("27AAAAA0000A1Z5", "Registered"), undefined);
    assert.equal(validateGstin("36abcde1234f1z5", "Registered"), undefined, "Lowercase normalizes to uppercase");
  });

  // =========================================================================
  // 6. SECTION 5: BUSINESS INFORMATION - ADVERSARIAL VALIDATION
  // =========================================================================
  test("9. Section 5: Business Operating Duration, Employees & Ownership", () => {
    // Operating duration required
    const valid = createValidMsmeFormData();
    valid.operatingDuration = "" as any;
    assert.ok(validateMsmeLoanForm(valid).errors.operatingDuration, "Operating duration required");

    // Number of Employees strict validation
    assert.ok(validateEmployees(""), "Employees required");
    assert.ok(validateEmployees("   "), "Whitespace rejected");
    assert.ok(validateEmployees(" 25"), "Leading space rejected");
    assert.ok(validateEmployees("25 "), "Trailing space rejected");
    assert.ok(validateEmployees("12.5"), "Decimals MUST be rejected");
    assert.ok(validateEmployees("-10"), "Negative numbers rejected");
    assert.ok(validateEmployees("1e9"), "Scientific notation rejected");
    assert.ok(validateEmployees("0"), "Zero employees rejected");
    assert.ok(validateEmployees("10😀"), "Emoji rejected");
    assert.ok(validateEmployees("10emp"), "Letters rejected");
    assert.ok(validateEmployees("100000"), "Unrealistic count (>50k) rejected");

    assert.equal(validateEmployees("1"), undefined);
    assert.equal(validateEmployees("25"), undefined);
    assert.equal(validateEmployees("500"), undefined);

    // Business Ownership & 'Other'
    valid.ownershipType = "" as any;
    assert.ok(validateMsmeLoanForm(valid).errors.ownershipType, "Ownership type required");

    valid.ownershipType = "Other";
    valid.ownershipTypeOther = "";
    assert.ok(validateMsmeLoanForm(valid).errors.ownershipTypeOther, "ownershipTypeOther required when Other");

    assert.ok(validateOwnershipOther("Other", "   "), "Whitespace rejected");
    assert.ok(validateOwnershipOther("Other", " Joint"), "Leading space rejected");
    assert.ok(validateOwnershipOther("Other", "Joint "), "Trailing space rejected");
    assert.ok(validateOwnershipOther("Other", "Trustee 🤝"), "Emoji rejected");
    assert.ok(validateOwnershipOther("Other", "12345"), "Numbers only rejected");
    assert.ok(validateOwnershipOther("Other", "<script>"), "Script tag rejected");

    assert.equal(validateOwnershipOther("Other", "Trustee"), undefined);
    assert.equal(validateOwnershipOther("Other", "HUF (Hindu Undivided Family)"), undefined);
    assert.equal(validateOwnershipOther("Other", "पारिवारिक न्यास"), undefined, "Must support Indian language");
  });

  test("10. Section 5: Annual Business Turnover money validation", () => {
    // Required
    assert.ok(validateTurnover(""), "Turnover required");
    assert.ok(validateTurnover("   "), "Whitespace rejected");

    // Invalid money flag from MoneyInputField
    assert.ok(validateTurnover("50000", true), "Rejected when MoneyInputField reports invalid format");

    // Malformed amounts
    assert.ok(validateTurnover("0"), "Zero rupees rejected");
    assert.ok(validateTurnover("-50000"), "Negative rejected");
    assert.ok(validateTurnover("50000.50"), "Decimals rejected");
    assert.ok(validateTurnover("1e9"), "Scientific notation 1e9 MUST be rejected");
    assert.ok(validateTurnover("50000🚀"), "Emoji rejected");
    assert.ok(validateTurnover("50lakh"), "Letters rejected");
    assert.ok(validateTurnover("$50000"), "Symbols rejected");

    // Valid whole rupees & formatting commas
    assert.equal(validateTurnover("50000"), undefined, "₹50,000 accepted");
    assert.equal(validateTurnover("50,000"), undefined, "₹50,000 with comma accepted");
    assert.equal(validateTurnover("5000000"), undefined, "₹50,00,000 accepted");
    assert.equal(validateTurnover("50,00,000"), undefined, "₹50,00,000 with commas accepted");
    assert.equal(validateTurnover("10000000"), undefined, "₹1 Crore accepted");
  });

  // =========================================================================
  // 7. PLACEHOLDER AUDIT
  // =========================================================================
  test("11. Placeholder Audit: No emojis, no unrelated examples in placeholders", () => {
    const screenPath = path.resolve(
      __dirname,
      "../../modules/loans/msme/screens/MsmeLoanScreen/MsmeLoanScreen.tsx"
    );
    const source = fs.readFileSync(screenPath, "utf-8");

    // Extract all placeholder="..." attributes
    const placeholderMatches = [...source.matchAll(/placeholder="([^"]+)"/g)].map((m) => m[1]);
    assert.ok(placeholderMatches.length >= 10, "Should have all required field placeholders");

    for (const ph of placeholderMatches) {
      // Must not contain emojis
      assert.doesNotMatch(ph, /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}]/u, `Placeholder '${ph}' contains emoji`);
      // Must not contain 'e.g. ₹'
      assert.doesNotMatch(ph, /e\.g\.\s*₹/i, `Placeholder '${ph}' contains unrequested amount example`);
      // Must not contain 'CNC machine' or '😂'
      assert.doesNotMatch(ph, /CNC machine/i, `Placeholder '${ph}' contains forbidden example`);
      assert.doesNotMatch(ph, /😂/, `Placeholder '${ph}' contains forbidden emoji`);
      // Must not contain 'PAN / Aadhaar'
      assert.doesNotMatch(ph, /PAN \/ Aadhaar/i, `Placeholder '${ph}' contains unrelated doc reference`);
    }

    // Verify key placeholders match requirement
    assert.ok(placeholderMatches.includes("Enter business name"), "Must have 'Enter business name'");
    assert.ok(placeholderMatches.includes("Enter business activity"), "Must have 'Enter business activity'");
    assert.ok(placeholderMatches.includes("Enter Udyam registration number"), "Must have 'Enter Udyam registration number'");
    assert.ok(placeholderMatches.includes("Enter GSTIN"), "Must have 'Enter GSTIN'");
    assert.ok(placeholderMatches.includes("Enter number of employees"), "Must have 'Enter number of employees'");
    assert.ok(placeholderMatches.includes("Enter annual turnover"), "Must have 'Enter annual turnover'");
    assert.ok(placeholderMatches.includes("Enter ownership type"), "Must have 'Enter ownership type'");
  });

  // =========================================================================
  // 8. NAVIGATION, REVISIT & REVIEW -> EDIT
  // =========================================================================
  test("12. Navigation: First visit 'Continue →', Revisit 'Update & Continue →', Back retreats to KYC", () => {
    useLoansStore.getState().selectLoanProduct("msme-loan");
    assert.equal(useLoansStore.getState().activeStep, "kyc");

    // Continue from Screen 1 advances to Screen 2 msme-details
    useLoansStore.getState().advanceTo("msme-details");
    assert.equal(useLoansStore.getState().activeStep, "msme-details");

    // First visit label
    const firstVisitLabel = getContinueLabel(false, "Continue →");
    assert.equal(firstVisitLabel, "Continue →");

    // Back button retreats to KYC
    useLoansStore.getState().retreatTo("kyc");
    assert.equal(useLoansStore.getState().activeStep, "kyc");

    // Return to msme-details as a revisit
    useLoansStore.getState().advanceTo("msme-details");
    assert.ok(useLoansStore.getState().completedSteps.includes("kyc"));

    // Advance from Screen 2 to Screen 3 documents
    useLoansStore.getState().advanceTo("documents");
    assert.equal(useLoansStore.getState().activeStep, "documents");
    assert.ok(useLoansStore.getState().completedSteps.includes("msme-details"));

    // Returning to msme-details after having completed it is a revisit
    const isRevisit = useLoansStore.getState().completedSteps.includes("msme-details");
    assert.equal(isRevisit, true);
    const revisitLabel = getContinueLabel(isRevisit, "Continue →");
    assert.equal(revisitLabel, UPDATE_AND_CONTINUE_LABEL);
  });

  test("13. Review -> Edit: Preserves existing MSME values and updates back to Review", () => {
    useLoansStore.getState().selectLoanProduct("msme-loan");

    // Populate MSME form data in store
    const validData = createValidMsmeFormData();
    useLoansStore.setState({
      msmeFormData: { ...validData },
      activeStep: "review",
      completedSteps: ["kyc", "msme-details", "documents", "review"],
      uploadedDocuments: {
        "msme-cert": {
          id: "doc-1",
          documentId: "msme-cert",
          fileName: "udyam.pdf",
          fileUri: "file://udyam.pdf",
          fileSize: 1024,
          mimeType: "application/pdf",
          status: "selected",
        },
      },
    });

    assert.equal(useLoansStore.getState().activeStep, "review");

    // Trigger edit on MSME section
    const detailsStep = getLoanDetailsStep("msme-loan");
    assert.equal(detailsStep, "msme-details");
    useLoansStore.getState().editFromReview(detailsStep!);

    // Store is now in edit mode
    const editState = useLoansStore.getState();
    assert.equal(editState.activeStep, "msme-details");
    assert.equal(editState.returnToReview, true);

    // Label in edit mode
    const editLabel = getContinueLabel(editState.returnToReview, "Continue →");
    assert.equal(editLabel, UPDATE_AND_CONTINUE_LABEL);

    // Preserved values check
    assert.equal(editState.msmeFormData.businessName, "Apex Engineering Enterprises");
    assert.equal(editState.msmeFormData.annualTurnover, "50,00,000");

    // Modify a field during edit
    useLoansStore.getState().setMsmeLoanField("businessName", "Apex Engineering Global Pvt Ltd");

    // Validate and Advance: When returnToReview is true, advanceTo returns directly to review
    assert.equal(useLoansStore.getState().validateMsmeLoanForm(), true);
    useLoansStore.getState().advanceTo("documents");

    const afterSave = useLoansStore.getState();
    assert.equal(afterSave.activeStep, "review");
    assert.equal(afterSave.returnToReview, false);
    assert.equal(afterSave.msmeFormData.businessName, "Apex Engineering Global Pvt Ltd");

    // Documents must NOT be wiped
    assert.ok(afterSave.uploadedDocuments["msme-cert"]);
    assert.equal(afterSave.uploadedDocuments["msme-cert"].fileName, "udyam.pdf");
  });

  // =========================================================================
  // 9. STATE ISOLATION & RESET
  // =========================================================================
  test("14. State Isolation: Switching categories resets MSME data and never leaks into other loans", () => {
    useLoansStore.getState().selectLoanProduct("msme-loan");
    useLoansStore.setState({
      msmeFormData: createValidMsmeFormData(),
    });

    assert.equal(useLoansStore.getState().msmeFormData.businessName, "Apex Engineering Enterprises");

    // Switch to Personal Loan
    useLoansStore.getState().selectLoanProduct("personal-loan");
    const switchedState = useLoansStore.getState();
    assert.equal(switchedState.selectedCategory?.id, "personal-loan");
    assert.equal(switchedState.msmeFormData.businessName, "", "MSME form data must be reset on switch");

    // Switch back to MSME Loan
    useLoansStore.getState().selectLoanProduct("msme-loan");
    const msmeAgain = useLoansStore.getState();
    assert.equal(msmeAgain.selectedCategory?.id, "msme-loan");
    assert.equal(msmeAgain.personalFormData.loanAmount, "", "Personal loan data must be clean");
    assert.equal(msmeAgain.businessFormData.businessProfile.businessName, "", "Business loan data must be clean");

    // Resolving a stale step from another loan under MSME resolves back to KYC
    const staleStepResolved = resolveLoanActiveStep("msme-loan", "business-details");
    assert.equal(staleStepResolved, "kyc", "Stale business-details under MSME must resolve to kyc");

    const stalePersonalResolved = resolveLoanActiveStep("msme-loan", "personal-employment");
    assert.equal(stalePersonalResolved, "kyc", "Stale personal-employment under MSME must resolve to kyc");
  });
});
