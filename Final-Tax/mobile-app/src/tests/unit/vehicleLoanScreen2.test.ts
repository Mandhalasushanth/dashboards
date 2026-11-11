/// <reference types="node" />
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, test } from "node:test";
import {
  getLoanDetailsStep,
  getLoanEntryStep,
} from "../../modules/loans/constants/loanFlow";
import { resolveLoanDocumentRequirements } from "../../modules/loans/constants/loanDocumentResolver";
import { getLoanDocumentChecklist } from "../../modules/loans/validation/loanDocumentsValidation";
import {
  localLoanSubmissionService,
  setLoanSubmissionService,
  type LoanSubmissionPayload,
} from "../../modules/loans/services/loanSubmissionService";
import { useLoansStore } from "../../modules/loans/store/loansStore";
import {
  createInitialBusinessFormData,
  createInitialKycData,
} from "../../modules/loans/store/loansStore.types";
import {
  createInitialVehicleLoanFormData,
  VEHICLE_CATEGORY_OPTIONS,
  VEHICLE_CONDITION_OPTIONS,
  VEHICLE_DEALER_OPTIONS,
  VEHICLE_PURCHASE_TIMELINE_OPTIONS,
  type VehicleLoanFormData,
} from "../../modules/loans/vehicle/types/vehicleLoan.types";
import {
  isValidWholeRupeeInput,
  normalizeMoneyInput,
} from "../../modules/loans/utils/moneyInput";
import { buildReviewSections } from "../../modules/loans/utils/loanReviewSummary";
import { getContinueLabel } from "../../modules/loans/constants/continueLabels";
import { validateVehicleLoanForm } from "../../modules/loans/vehicle/validation/vehicleLoanValidation";
import { validateReviewSubmission } from "../../modules/loans/validation/loanReviewValidation";
import type { LoanDocumentUpload } from "../../modules/loans/types/loanReview.types";
import type { LoanKycData } from "../../modules/loans/types/loanKyc.types";

const root = path.join(process.cwd(), "src/modules/loans");
const readLoanSource = (relativePath: string): string =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const vehicleCategory = {
  id: "vehicle-loan" as const,
  title: "Vehicle Loan",
  description: "Vehicle financing",
  image: { uri: "vehicle-test" },
};

const validVehicleForm = (): VehicleLoanFormData => ({
  ...createInitialVehicleLoanFormData(),
  requestedLoanAmount: "700000",
  vehicleCondition: "New Vehicle",
  vehicleCategory: "Car",
  make: "Tata Motors",
  model: "Nexon",
  approximateVehiclePrice: "1000000",
  dealerSelected: "Yes",
  dealerName: "City Motors",
  purchaseTimeline: "Within 30 days",
  registrationState: "Telangana",
});

const document = {
  id: "vehicle-document",
  documentId: "vehicle-document",
  fileName: "vehicle.pdf",
  fileUri: "file:///vehicle.pdf",
  fileSize: 10,
  mimeType: "application/pdf",
  status: "selected" as const,
};

const validKycData: LoanKycData = {
  fullName: "Ravi Kumar",
  mobile: "9876543210",
  email: "ravi.kumar@example.com",
  pan: "ABCPE1234F",
  aadhaar: "234567890123",
  dob: "15-08-1985",
  currentAddress: {
    houseNumber: "Flat 402, Sai Residency",
    street: "MG Road",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500001",
  },
  isPermanentSameAsCurrent: true,
  permanentAddress: {
    houseNumber: "Flat 402, Sai Residency",
    street: "MG Road",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500001",
  },
  consentGiven: true,
  isProfilePrefilled: false,
};

describe("Vehicle Loan Screen 2", () => {
  beforeEach(() => useLoansStore.getState().resetAll());

  test("Vehicle enters the existing common KYC screen before its dedicated Screen 2", () => {
    assert.equal(getLoanEntryStep("vehicle-loan"), "kyc");
    assert.equal(getLoanDetailsStep("vehicle-loan"), "vehicle-details");
    useLoansStore.getState().selectCategory(vehicleCategory);
    assert.equal(useLoansStore.getState().activeStep, "kyc");
    useLoansStore.getState().advanceTo("vehicle-details");
    assert.equal(useLoansStore.getState().activeStep, "vehicle-details");

    const main = readLoanSource("screens/LoansMainScreen/LoansMainScreen.tsx");
    assert.match(main, /import \{ LoanKycScreen \} from "\.\.\/LoanKycScreen"/);
    assert.match(main, /case "kyc":[\s\S]*?<LoanKycScreen/);
    assert.match(main, /case "vehicle-details":[\s\S]*?<VehicleLoanScreen/);
    assert.equal(
      fs.existsSync(path.join(root, "vehicle/screens/VehicleKycScreen")),
      false
    );
  });

  test("Screen 2 shows its requested heading, all specified fields and shared controls", () => {
    const screen = readLoanSource(
      "vehicle/screens/VehicleLoanScreen/VehicleLoanScreen.tsx"
    );
    for (const label of [
      "Tell us about your vehicle",
      "Vehicle & Loan Details",
      "Loan Requirement",
      "Vehicle Condition",
      "Vehicle Category",
      "Please specify",
      "Vehicle Make / Brand",
      "Vehicle Model",
      "Approximate Vehicle Price",
      "Dealer Selected?",
      "Dealer Name",
      "Purchase Timeline",
      "Registration State",
    ]) {
      assert.ok(screen.includes(label), label);
    }
    assert.match(screen, /from "@\/shared\/components\/Dropdown"/);
    assert.match(screen, /from "\.\.\/\.\.\/\.\.\/components\/MoneyInputField"/);
    assert.match(screen, /KeyboardAwareScrollView/);
    assert.match(screen, /KeyboardStickyFooter/);
    assert.match(screen, /LoanFlowHeader/);
    assert.match(screen, /INDIAN_STATES_AND_UTS/);
    assert.match(screen, /form\.vehicleCategory === "Other"/);
    assert.match(screen, /form\.dealerSelected === "Yes"/);
    assert.match(screen, /errors\[field\]/);
    assert.equal(
      fs.existsSync(path.join(root, "vehicle/components/Dropdown")),
      false
    );
    assert.equal(
      fs.existsSync(path.join(root, "vehicle/components/MoneyInputField")),
      false
    );
  });

  test("requested amount is stored as whole rupee digits and malformed entries are rejected", () => {
    const store = useLoansStore.getState();
    store.selectCategory(vehicleCategory);
    store.setVehicleLoanField("requestedLoanAmount", "2500000");
    assert.equal(
      useLoansStore.getState().vehicleFormData.requestedLoanAmount,
      "2500000"
    );

    for (const value of ["1e9", "-1", "12.50", "₹100", "  ", "1,234,567"]) {
      assert.equal(isValidWholeRupeeInput(value), false, value);
    }
    for (const value of ["", "2500000", "1,00,000", "12,34,567"]) {
      assert.equal(isValidWholeRupeeInput(value), true, value);
    }
    store.setVehicleMoneyInputValidity("requestedLoanAmount", false);
    assert.equal(store.validateVehicleLoanForm(), false);
    assert.ok(useLoansStore.getState().vehicleErrors.requestedLoanAmount);
    store.setVehicleLoanField("requestedLoanAmount", "2500000");
    assert.equal(
      useLoansStore.getState().invalidVehicleMoneyFields.requestedLoanAmount,
      undefined
    );
  });

  test("single selection options are the specified values", () => {
    assert.deepEqual(VEHICLE_CONDITION_OPTIONS, ["New Vehicle", "Used Vehicle"]);
    assert.deepEqual(VEHICLE_CATEGORY_OPTIONS, [
      "Car",
      "Two-Wheeler",
      "Commercial Vehicle",
      "Other",
    ]);
    assert.deepEqual(VEHICLE_DEALER_OPTIONS, ["Yes", "No"]);
    assert.deepEqual(VEHICLE_PURCHASE_TIMELINE_OPTIONS, [
      "Within 7 days",
      "Within 30 days",
      "1–3 months",
      "Just exploring",
    ]);
    const store = useLoansStore.getState();
    store.selectCategory(vehicleCategory);
    store.setVehicleLoanField("vehicleCondition", "Used Vehicle");
    store.setVehicleLoanField("vehicleCategory", "Two-Wheeler");
    assert.equal(
      useLoansStore.getState().vehicleFormData.vehicleCondition,
      "Used Vehicle"
    );
    assert.equal(
      useLoansStore.getState().vehicleFormData.vehicleCategory,
      "Two-Wheeler"
    );
  });

  test("Other and dealer fields are conditionally required; fields accept Unicode text", () => {
    const base = validVehicleForm();
    const otherErrors = validateVehicleLoanForm({
      ...base,
      vehicleCategory: "Other",
      vehicleCategoryOther: "   ",
    }).errors;
    assert.ok(otherErrors.vehicleCategoryOther);
    assert.equal(
      validateVehicleLoanForm({
        ...base,
        vehicleCategory: "Other",
        vehicleCategoryOther: "Electric rickshaw",
      }).errors.vehicleCategoryOther,
      undefined
    );
    assert.ok(
      validateVehicleLoanForm({ ...base, dealerSelected: "Yes", dealerName: " " })
        .errors.dealerName
    );
    assert.equal(
      validateVehicleLoanForm({
        ...base,
        dealerSelected: "No",
        dealerName: "",
      }).errors.dealerName,
      undefined
    );
    assert.equal(
      validateVehicleLoanForm({
        ...base,
        make: "टाटा मोटर्स",
        model: "नेक्सॉन",
      }).isValid,
      true
    );
  });

  test("incomplete form shows field errors while a valid form is accepted", () => {
    const empty = validateVehicleLoanForm(createInitialVehicleLoanFormData());
    assert.equal(empty.isValid, false);
    for (const field of [
      "requestedLoanAmount",
      "vehicleCondition",
      "vehicleCategory",
      "make",
      "model",
      "approximateVehiclePrice",
      "dealerSelected",
      "purchaseTimeline",
      "registrationState",
    ] as const) {
      assert.ok(empty.errors[field], field);
    }

    assert.equal(validateVehicleLoanForm(validVehicleForm()).isValid, true);
    assert.equal(
      validateVehicleLoanForm({
        ...validVehicleForm(),
        requestedLoanAmount: "9007199254740991",
      }).isValid,
      true,
      "No product-specific loan cap is defined"
    );
    for (const value of ["0", "1e9", "-200", "250.25", "99999999999999999"]) {
      assert.ok(
        validateVehicleLoanForm({
          ...validVehicleForm(),
          approximateVehiclePrice: value,
        }).errors.approximateVehiclePrice,
        value
      );
    }
  });

  test("valid data advances to Documents; Back returns to shared KYC", () => {
    const store = useLoansStore.getState();
    store.selectCategory(vehicleCategory);
    useLoansStore.setState({ vehicleFormData: validVehicleForm() });
    assert.equal(store.validateVehicleLoanForm(), true);
    store.advanceTo("vehicle-details");
    store.advanceTo("documents");
    assert.equal(useLoansStore.getState().activeStep, "documents");
    useLoansStore.getState().retreatTo("vehicle-details");
    useLoansStore.getState().retreatTo("kyc");
    assert.equal(useLoansStore.getState().activeStep, "kyc");

    const main = readLoanSource("screens/LoansMainScreen/LoansMainScreen.tsx");
    assert.match(main, /onBackToKyc=\{\(\) => retreatTo\("kyc"\)\}/);
  });

  test("Review Edit hides Back, uses Update & Continue, returns to Review and preserves documents", () => {
    const store = useLoansStore.getState();
    store.selectCategory(vehicleCategory);
    useLoansStore.setState({
      vehicleFormData: validVehicleForm(),
      uploadedDocuments: { "vehicle-document": document },
    });
    store.advanceTo("vehicle-details");
    store.advanceTo("documents");
    store.advanceTo("review");
    store.editFromReview("vehicle-details");
    assert.equal(useLoansStore.getState().activeStep, "vehicle-details");
    assert.equal(useLoansStore.getState().returnToReview, true);
    assert.equal(
      getContinueLabel(true, "Continue →"),
      "Update & Continue →"
    );
    store.setVehicleLoanField("make", "Tata Motors Limited");
    store.advanceTo("documents");
    const afterUpdate = useLoansStore.getState();
    assert.equal(afterUpdate.activeStep, "review");
    assert.deepEqual(afterUpdate.uploadedDocuments, {
      "vehicle-document": document,
    });
    assert.equal(afterUpdate.vehicleFormData.make, "Tata Motors Limited");

    const screen = readLoanSource(
      "vehicle/screens/VehicleLoanScreen/VehicleLoanScreen.tsx"
    );
    const header = readLoanSource("components/LoanFlowHeader/LoanFlowHeader.tsx");
    assert.match(screen, /isEditMode=\{isEditMode\}/);
    assert.match(header, /onBack: undefined/);
    assert.match(screen, /getContinueLabel\(\s*isEditMode \|\| isRevisit/);
  });

  test("vehicle documents and review summary never fall back to Business", () => {
    const requirements = resolveLoanDocumentRequirements({
      categoryId: "vehicle-loan",
      businessFormData: createInitialBusinessFormData(),
      vehicleFormData: validVehicleForm(),
    });
    assert.deepEqual(
      requirements.map((item) => item.name),
      ["Vehicle Quotation / Proforma Invoice", "Booking Receipt"]
    );
    assert.ok(requirements.length > 0);
    assert.equal(
      requirements.some((item) =>
        /business|working capital/i.test(`${item.name} ${item.description}`)
      ),
      false
    );
    const documentScreen = readLoanSource(
      "screens/LoanDocumentUploadScreen/LoanDocumentUploadScreen.tsx"
    );
    assert.match(documentScreen, /vehicleFormData/);

    const sections = buildReviewSections(
      createInitialKycData(),
      createInitialBusinessFormData(),
      undefined,
      "vehicle-loan",
      undefined,
      undefined,
      validVehicleForm()
    );
    assert.deepEqual(
      sections.map((section) => section.id),
      ["applicant", "vehicle"]
    );
    assert.equal(sections[1].editTarget, "vehicle-details");
  });

  test("vehicle document requirements change between New and Used conditions", () => {
    const base = validVehicleForm();
    const resolve = (vehicleCondition: VehicleLoanFormData["vehicleCondition"]) =>
      resolveLoanDocumentRequirements({
        categoryId: "vehicle-loan",
        businessFormData: createInitialBusinessFormData(),
        vehicleFormData: { ...base, vehicleCondition },
      });

    const newRequirements = resolve("New Vehicle");
    assert.deepEqual(
      newRequirements.map(({ id, isMandatory }) => [id, isMandatory]),
      [
        ["vehicle_new_quotation", true],
        ["vehicle_booking_receipt", false],
      ]
    );
    const usedRequirements = resolve("Used Vehicle");
    assert.deepEqual(
      usedRequirements.map(({ id, isMandatory }) => [id, isMandatory]),
      [["vehicle_used_rc_copy", true]]
    );
    assert.equal(resolve("").length, 0);
    assert.equal(new Set(newRequirements.map(({ id }) => id)).size, newRequirements.length);
    assert.equal(new Set(usedRequirements.map(({ id }) => id)).size, usedRequirements.length);
  });

  test("changing vehicle condition removes incompatible uploads but preserves compatible state", () => {
    const store = useLoansStore.getState();
    store.selectCategory(vehicleCategory);
    store.setVehicleLoanField("vehicleCondition", "New Vehicle");
    const quotation: LoanDocumentUpload = {
      ...document,
      id: "vehicle_new_quotation_file",
      documentId: "vehicle_new_quotation",
    };
    const booking: LoanDocumentUpload = {
      ...document,
      id: "vehicle_booking_receipt_file",
      documentId: "vehicle_booking_receipt",
    };
    store.setDocumentAttachment(quotation.documentId, quotation);
    store.setDocumentAttachment(booking.documentId, booking);
    store.advanceTo("documents");
    store.advanceTo("review");
    store.editFromReview("vehicle-details");

    useLoansStore.getState().setVehicleLoanField("vehicleCondition", "Used Vehicle");
    const afterSwitch = useLoansStore.getState();
    assert.deepEqual(
      Object.keys(afterSwitch.uploadedDocuments),
      []
    );
    assert.equal(afterSwitch.activeStep, "vehicle-details");
    assert.equal(afterSwitch.returnToReview, true);
  });

  test("missing mandatory vehicle documents block Review; optional documents do not", () => {
    const kyc = { ...validKycData };
    const vehicle = validVehicleForm();
    const quotation: LoanDocumentUpload = {
      ...document,
      id: "vehicle_new_quotation_file",
      documentId: "vehicle_new_quotation",
    };
    const missing = validateReviewSubmission(
      kyc,
      createInitialBusinessFormData(),
      {},
      true,
      undefined,
      "vehicle-loan",
      undefined,
      undefined,
      vehicle
    );
    assert.equal(missing.isValid, false);
    assert.ok(missing.errors.documents?.vehicle_new_quotation);

    const uploadedRequired = validateReviewSubmission(
      kyc,
      createInitialBusinessFormData(),
      { [quotation.documentId]: quotation },
      true,
      undefined,
      "vehicle-loan",
      undefined,
      undefined,
      vehicle
    );
    assert.equal(uploadedRequired.isValid, true);
    assert.deepEqual(uploadedRequired.errors.documents, {});

    const usedVehicle = { ...vehicle, vehicleCondition: "Used Vehicle" as const };
    const missingRc = validateReviewSubmission(
      kyc,
      createInitialBusinessFormData(),
      {},
      true,
      undefined,
      "vehicle-loan",
      undefined,
      undefined,
      usedVehicle
    );
    assert.equal(missingRc.isValid, false);
    assert.ok(missingRc.errors.documents?.vehicle_used_rc_copy);
  });

  test("uploaded vehicle documents appear in the Review checklist", () => {
    const requirements = resolveLoanDocumentRequirements({
      categoryId: "vehicle-loan",
      businessFormData: createInitialBusinessFormData(),
      vehicleFormData: validVehicleForm(),
    });
    const quotation: LoanDocumentUpload = {
      ...document,
      id: "vehicle_new_quotation_file",
      documentId: "vehicle_new_quotation",
    };
    assert.deepEqual(
      getLoanDocumentChecklist(requirements, {
        [quotation.documentId]: quotation,
      }),
      [
        {
          id: "vehicle_new_quotation",
          name: "Vehicle Quotation / Proforma Invoice",
          isMandatory: true,
          isUploaded: true,
          fileName: "vehicle.pdf",
        },
        {
          id: "vehicle_booking_receipt",
          name: "Booking Receipt",
          isMandatory: false,
          isUploaded: false,
          fileName: undefined,
        },
      ]
    );
  });

  test("submission includes only the active Vehicle Loan documents and form", async () => {
    let submittedPayload: LoanSubmissionPayload | undefined;
    setLoanSubmissionService({
      submit: async (payload) => {
        submittedPayload = payload;
        return {
          applicationId: "TXE-LN-TEST",
          submittedAt: "2026-10-15T00:00:00.000Z",
          isSyncedToServer: false,
        };
      },
    });

    try {
      const store = useLoansStore.getState();
      store.selectCategory(vehicleCategory);
      useLoansStore.setState({ kycData: validKycData });
      store.setVehicleLoanField("requestedLoanAmount", "700000");
      store.setVehicleLoanField("vehicleCondition", "New Vehicle");
      store.setVehicleLoanField("vehicleCategory", "Car");
      store.setVehicleLoanField("make", "Tata Motors");
      store.setVehicleLoanField("model", "Nexon");
      store.setVehicleLoanField("approximateVehiclePrice", "1000000");
      store.setVehicleLoanField("dealerSelected", "Yes");
      store.setVehicleLoanField("dealerName", "City Motors");
      store.setVehicleLoanField("purchaseTimeline", "Within 30 days");
      store.setVehicleLoanField("registrationState", "Telangana");
      store.setDocumentAttachment("vehicle_new_quotation", {
        ...document,
        documentId: "vehicle_new_quotation",
      });
      store.setDocumentAttachment("business_proof", {
        ...document,
        documentId: "business_proof",
      });
      store.setReviewConsent(true);

      assert.equal(await useLoansStore.getState().submitLoanApplication(), true);
      assert.equal(submittedPayload?.categoryId, "vehicle-loan");
      assert.equal(submittedPayload?.vehicleFormData?.vehicleCondition, "New Vehicle");
      assert.deepEqual(
        submittedPayload?.documents.map(({ documentId }) => documentId),
        ["vehicle_new_quotation"]
      );
    } finally {
      setLoanSubmissionService(localLoanSubmissionService);
      useLoansStore.getState().resetAll();
    }
  });

  describe("Vehicle Loan Money Input & Validation Suite (14 Regression Requirements)", () => {
    test("1. ₹2,500 does not cause a false validation error merely because commas are displayed", () => {
      const formComma = { ...validVehicleForm(), requestedLoanAmount: "2,500", approximateVehiclePrice: "2,500" };
      const resComma = validateVehicleLoanForm(formComma);
      assert.equal(resComma.errors.requestedLoanAmount, undefined);
      assert.equal(resComma.errors.approximateVehiclePrice, undefined);

      const formRupee = { ...validVehicleForm(), requestedLoanAmount: "₹2,500", approximateVehiclePrice: "₹2,500" };
      const resRupee = validateVehicleLoanForm(formRupee);
      assert.equal(resRupee.errors.requestedLoanAmount, undefined);
      assert.equal(resRupee.errors.approximateVehiclePrice, undefined);
    });

    test("2. ₹25,000 is accepted", () => {
      for (const amount of ["25000", "25,000", "₹25,000"]) {
        const form = { ...validVehicleForm(), requestedLoanAmount: amount, approximateVehiclePrice: amount };
        const res = validateVehicleLoanForm(form);
        assert.equal(res.errors.requestedLoanAmount, undefined, `Failed on ${amount}`);
        assert.equal(res.errors.approximateVehiclePrice, undefined, `Failed on ${amount}`);
      }
    });

    test("3. ₹1,00,000 is accepted", () => {
      for (const amount of ["100000", "1,00,000", "₹1,00,000"]) {
        const form = { ...validVehicleForm(), requestedLoanAmount: amount, approximateVehiclePrice: amount };
        const res = validateVehicleLoanForm(form);
        assert.equal(res.errors.requestedLoanAmount, undefined, `Failed on ${amount}`);
        assert.equal(res.errors.approximateVehiclePrice, undefined, `Failed on ${amount}`);
      }
    });

    test("4. ₹10,00,000 is accepted", () => {
      for (const amount of ["1000000", "10,00,000", "₹10,00,000"]) {
        const form = { ...validVehicleForm(), requestedLoanAmount: amount, approximateVehiclePrice: amount };
        const res = validateVehicleLoanForm(form);
        assert.equal(res.errors.requestedLoanAmount, undefined, `Failed on ${amount}`);
        assert.equal(res.errors.approximateVehiclePrice, undefined, `Failed on ${amount}`);
      }
    });

    test("5. Larger valid amounts are not truncated at 4 digits and support realistic values", () => {
      const realisticAmounts = [
        "25000",
        "50000",
        "100000",
        "250000",
        "500000",
        "800000",
        "1000000",
        "2500000",
        "5000000",
        "10000000",
        "50000000",
      ];
      for (const amount of realisticAmounts) {
        const form = { ...validVehicleForm(), requestedLoanAmount: amount, approximateVehiclePrice: amount };
        const res = validateVehicleLoanForm(form);
        assert.equal(res.errors.requestedLoanAmount, undefined, `Rejected realistic amount: ${amount}`);
        assert.equal(res.errors.approximateVehiclePrice, undefined, `Rejected realistic price: ${amount}`);
      }
    });

    test("6. Decimal values are rejected", () => {
      for (const decimal of ["50,000.75", "50000.75", "100.50", "0.99", ".99"]) {
        const form = { ...validVehicleForm(), requestedLoanAmount: decimal, approximateVehiclePrice: decimal };
        const res = validateVehicleLoanForm(form);
        assert.ok(res.errors.requestedLoanAmount, `Did not reject decimal: ${decimal}`);
        assert.ok(res.errors.approximateVehiclePrice, `Did not reject decimal: ${decimal}`);
      }
    });

    test("7. Negative values are rejected", () => {
      for (const neg of ["-50000", "-2500", "-1"]) {
        const form = { ...validVehicleForm(), requestedLoanAmount: neg, approximateVehiclePrice: neg };
        const res = validateVehicleLoanForm(form);
        assert.ok(res.errors.requestedLoanAmount, `Did not reject negative: ${neg}`);
        assert.ok(res.errors.approximateVehiclePrice, `Did not reject negative: ${neg}`);
      }
    });

    test("8. Scientific notation is rejected", () => {
      for (const sci of ["1e9", "1E6", "2e5"]) {
        const form = { ...validVehicleForm(), requestedLoanAmount: sci, approximateVehiclePrice: sci };
        const res = validateVehicleLoanForm(form);
        assert.ok(res.errors.requestedLoanAmount, `Did not reject scientific notation: ${sci}`);
        assert.ok(res.errors.approximateVehiclePrice, `Did not reject scientific notation: ${sci}`);
      }
    });

    test("9. Malformed pasted values do not become unintended valid amounts", () => {
      assert.equal(normalizeMoneyInput("1e9"), "1e9"); // NOT 19
      assert.equal(normalizeMoneyInput("50,000.75"), "50,000.75"); // NOT 5000075 or 50000
      assert.equal(normalizeMoneyInput("50@000"), "50@000"); // NOT 50000
      assert.equal(normalizeMoneyInput("50#000"), "50#000");
      assert.equal(normalizeMoneyInput("50$000"), "50$000");
      assert.equal(normalizeMoneyInput("50%000"), "50%000");
      assert.equal(normalizeMoneyInput("50abc"), "50abc"); // NOT 50
      assert.equal(normalizeMoneyInput("-50000"), "-50000");
      assert.equal(normalizeMoneyInput("50 000"), "50 000");
      assert.equal(normalizeMoneyInput("50\n000"), "50 000");

      for (const malformed of [
        "1e9",
        "50,000.75",
        "50@000",
        "50#000",
        "50$000",
        "50%000",
        "50abc",
        "-50000",
        "50 000",
        "50\n000",
      ]) {
        const form = { ...validVehicleForm(), requestedLoanAmount: malformed, approximateVehiclePrice: malformed };
        const res = validateVehicleLoanForm(form);
        assert.ok(res.errors.requestedLoanAmount, `Did not reject malformed: ${malformed}`);
        assert.ok(res.errors.approximateVehiclePrice, `Did not reject malformed: ${malformed}`);
      }
    });

    test("10. Clearing the field restores the placeholder", () => {
      const moneyInputSrc = readLoanSource("components/MoneyInputField/MoneyInputField.tsx");
      assert.match(moneyInputSrc, /if \(!value\) return "";/);
      assert.match(moneyInputSrc, /placeholder=\{placeholder\}/);
      assert.match(moneyInputSrc, /maxLength=\{maxLength\}/);
      assert.match(moneyInputSrc, /maxLength = 22/);

      assert.equal(normalizeMoneyInput(""), "");
      assert.equal(normalizeMoneyInput("   "), "");
    });

    test("11. Vehicle Loan does not affect other loan money fields", () => {
      const store = useLoansStore.getState();
      store.resetAll();
      store.setVehicleLoanField("requestedLoanAmount", "800000");
      store.setVehicleLoanField("approximateVehiclePrice", "1200000");

      const state = useLoansStore.getState();
      assert.equal(state.vehicleFormData.requestedLoanAmount, "800000");
      assert.equal(state.vehicleFormData.approximateVehiclePrice, "1200000");
      assert.equal(state.businessFormData.businessLoan.loanAmount, "");
      assert.equal(state.businessFormData.workingCapital.loanAmount, "");
      assert.equal(state.homeLoanFormData.loanAmount, "");
      assert.equal(state.propertyFormData.requestedAmount, "");
      assert.equal(state.machineryFormData.requestedLoanAmount, "");
    });

    test("12. Back → Edit → Update & Continue preserves the corrected amount", () => {
      const store = useLoansStore.getState();
      store.resetAll();
      store.selectCategory(vehicleCategory);
      store.setVehicleLoanField("requestedLoanAmount", "500000");
      store.setVehicleLoanField("approximateVehiclePrice", "700000");
      store.setVehicleLoanField("vehicleCondition", "New Vehicle");
      store.setVehicleLoanField("vehicleCategory", "Car");
      store.setVehicleLoanField("make", "Maruti Suzuki");
      store.setVehicleLoanField("model", "Swift");
      store.setVehicleLoanField("dealerSelected", "No");
      store.setVehicleLoanField("purchaseTimeline", "Within 7 days");
      store.setVehicleLoanField("registrationState", "Delhi");

      // Advance to documents
      store.advanceTo("documents");
      assert.equal(useLoansStore.getState().activeStep, "documents");

      // Go back to screen 2
      store.advanceTo("vehicle-details");
      assert.equal(useLoansStore.getState().vehicleFormData.requestedLoanAmount, "500000");

      // Edit amount
      store.setVehicleLoanField("requestedLoanAmount", "800000");
      store.setVehicleLoanField("approximateVehiclePrice", "1000000");

      // Update & Continue
      store.advanceTo("documents");
      const updated = useLoansStore.getState();
      assert.equal(updated.activeStep, "documents");
      assert.equal(updated.vehicleFormData.requestedLoanAmount, "800000");
      assert.equal(updated.vehicleFormData.approximateVehiclePrice, "1000000");
    });

    test("13. Review → Edit still uses the existing Update & Continue behavior", () => {
      const store = useLoansStore.getState();
      store.resetAll();
      store.selectCategory(vehicleCategory);
      store.editFromReview("vehicle-details");

      const state = useLoansStore.getState();
      assert.equal(state.activeStep, "vehicle-details");
      assert.equal(state.returnToReview, true);
      assert.equal(getContinueLabel(true, "Continue →"), "Update & Continue →");

      store.setVehicleLoanField("requestedLoanAmount", "1500000");
      store.advanceTo("documents");
      const after = useLoansStore.getState();
      assert.equal(after.activeStep, "review");
      assert.equal(after.vehicleFormData.requestedLoanAmount, "1500000");
    });

    test("14. No duplicate MoneyInputField is created", () => {
      const forbiddenPaths = [
        "vehicle/components/MoneyInputField",
        "machinery/components/MoneyInputField",
        "homeLoan/components/MoneyInputField",
        "property/components/MoneyInputField",
        "personalLoan/components/MoneyInputField",
        "businessWorkingCapital/components/MoneyInputField",
      ];
      for (const rel of forbiddenPaths) {
        assert.equal(
          fs.existsSync(path.join(root, rel)),
          false,
          `Duplicate component found at ${rel}`
        );
      }
      assert.equal(
        fs.existsSync(path.join(root, "components/MoneyInputField/MoneyInputField.tsx")),
        true
      );
    });
  });
});
