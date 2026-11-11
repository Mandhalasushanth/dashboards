/// <reference types="node" />
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test, describe, beforeEach } from "node:test";
import { useLoansStore } from "../../modules/loans/store/loansStore";
import {
  createInitialBusinessFormData,
  createInitialKycData,
} from "../../modules/loans/store/loansStore.types";
import {
  MAX_PROPERTY_LOAN_AMOUNT,
  MIN_PROPERTY_LOAN_AMOUNT,
  validatePropertyLoanForm,
} from "../../modules/loans/property/validation/propertyLoanValidation";
import {
  createInitialPropertyFormData,
  PROPERTY_PURPOSE_OPTIONS,
  type PropertyLoanFormData,
} from "../../modules/loans/property/types/property.types";
import {
  getOwnershipOptions,
  getStageQuestion,
  prunePropertyFormData,
} from "../../modules/loans/property/utils/propertyFlow";
import { getPropertyDocumentRequirements } from "../../modules/loans/property/constants/propertyDocuments";
import { resolveLoanDocumentRequirements } from "../../modules/loans/constants/loanDocumentResolver";
import { buildReviewSections, getSubmittedLoanSummary } from "../../modules/loans/utils/loanReviewSummary";
import {
  localLoanSubmissionService,
  setLoanSubmissionService,
  type LoanSubmissionPayload,
} from "../../modules/loans/services/loanSubmissionService";
import type { LoanDocumentUpload } from "../../modules/loans/types/loanReview.types";

const category = {
  id: "property-loan" as const,
  title: "Property Loan",
  description: "Property",
  image: { uri: "test" },
};

const valid = (): PropertyLoanFormData => ({
  ...createInitialPropertyFormData(),
  requestedAmount: "2500000",
  purpose: "Home Purchase",
  propertyStatus: "Identified Property",
  propertyType: "Apartment / Flat",
  city: "Hyderabad",
  state: "Telangana",
  pinCode: "500081",
  ownership: "Self",
});

const errorsOf = (patch: Partial<PropertyLoanFormData>) =>
  validatePropertyLoanForm({ ...valid(), ...patch }).errors;

const doc = (id: string): LoanDocumentUpload => ({
  id: `${id}_1`,
  documentId: id,
  fileName: `${id}.pdf`,
  fileUri: `file:///${id}.pdf`,
  fileSize: 100,
  mimeType: "application/pdf",
  status: "selected",
});

const read = (file: string) =>
  fs.readFileSync(path.join(process.cwd(), "src/modules/loans", file), "utf8");

function seedApplication() {
  const s = useLoansStore.getState();
  s.selectCategory(category);
  useLoansStore.setState({
    kycData: {
      ...createInitialKycData(),
      fullName: "Anita Rao",
      mobile: "9876543210",
      consentGiven: true,
      currentAddress: { houseNumber: "1", street: "MG Road", city: "Hyderabad", state: "Telangana", pincode: "500001" },
    },
    propertyFormData: valid(),
  });
  getPropertyDocumentRequirements(valid())
    .filter((d) => d.isMandatory)
    .forEach((d) => useLoansStore.getState().setDocumentAttachment(d.id, doc(d.id)));
  useLoansStore.getState().setReviewConsent(true);
}

describe("property loan screen 2 validation", () => {
  test("a minimum valid form passes", () => {
    assert.equal(validatePropertyLoanForm(valid()).isValid, true);
  });

  test("amount: missing, zero, invalid characters, bounds and decimals", () => {
    ["", "   ", "0", "abc", "1e9", "-5", "NaN", "Infinity"].forEach((amount) => {
      assert.ok(errorsOf({ requestedAmount: amount }).requestedAmount, JSON.stringify(amount));
    });
    assert.ok(errorsOf({ requestedAmount: String(MIN_PROPERTY_LOAN_AMOUNT - 1) }).requestedAmount);
    assert.ok(errorsOf({ requestedAmount: String(MAX_PROPERTY_LOAN_AMOUNT + 1) }).requestedAmount);
    assert.ok(errorsOf({ requestedAmount: "9".repeat(40) }).requestedAmount);
    assert.ok(errorsOf({ requestedAmount: "250000.50" }).requestedAmount);
    assert.equal(errorsOf({ requestedAmount: String(MIN_PROPERTY_LOAN_AMOUNT) }).requestedAmount, undefined);
    assert.equal(errorsOf({ requestedAmount: String(MAX_PROPERTY_LOAN_AMOUNT) }).requestedAmount, undefined);
  });

  test("purpose is required and 'Other' needs a real specification", () => {
    assert.match(errorsOf({ purpose: "" }).purpose ?? "", /purpose/);
    ["", "   ", "!!", "😀"].forEach((text) => {
      assert.ok(errorsOf({ purpose: "Other", purposeOther: text, ownership: "Self" }).purposeOther, JSON.stringify(text));
    });
    assert.equal(errorsOf({ purpose: "Other", purposeOther: "Farm house", ownership: "Self" }).purposeOther, undefined);
    assert.equal(errorsOf({ purpose: "Home Purchase", purposeOther: "" }).purposeOther, undefined);
  });

  test("property type is required and 'Other' needs a specification", () => {
    assert.match(errorsOf({ propertyType: "" }).propertyType ?? "", /property type/);
    assert.ok(errorsOf({ propertyType: "Other", propertyTypeOther: "  " }).propertyTypeOther);
    assert.equal(errorsOf({ propertyType: "Other", propertyTypeOther: "Warehouse" }).propertyTypeOther, undefined);
  });

  test("city and state: missing, whitespace and values outside the list are rejected", () => {
    ["", "   ", "1234", "😀", "x".repeat(200)].forEach((city) => {
      assert.ok(errorsOf({ city }).city, JSON.stringify(city));
    });
    ["", "Atlantis", "telangana "].forEach((state) => {
      assert.ok(errorsOf({ state }).state, JSON.stringify(state));
    });
    assert.equal(errorsOf({ state: "Karnataka" }).state, undefined);
  });

  test("PIN code must be exactly six digits and not start with zero", () => {
    ["", "12345", "1234567", "abcdef", "000000", "50 0081", "５００００１"].forEach((pinCode) => {
      assert.match(errorsOf({ pinCode }).pinCode ?? "", /6-digit/, JSON.stringify(pinCode));
    });
    assert.equal(errorsOf({ pinCode: "560001" }).pinCode, undefined);
  });

  test("purchase purposes need the property status", () => {
    ["Home Purchase", "Plot Purchase"].forEach((purpose) => {
      const errors = errorsOf({ purpose: purpose as PropertyLoanFormData["purpose"], propertyStatus: "" });
      assert.ok(errors.propertyStatus, purpose);
      assert.equal(errors.constructionStage, undefined);
    });
  });

  test("construction purposes need the construction stage, not the purchase status", () => {
    ["Home Construction", "Plot + Construction"].forEach((purpose) => {
      const errors = errorsOf({ purpose: purpose as PropertyLoanFormData["purpose"], constructionStage: "", propertyStatus: "", ownership: "Self" });
      assert.ok(errors.constructionStage, purpose);
      assert.equal(errors.propertyStatus, undefined);
    });
  });

  test("renovation needs the renovation status", () => {
    const errors = errorsOf({ purpose: "Home Renovation", renovationStatus: "", propertyStatus: "", ownership: "Self" });
    assert.ok(errors.renovationStatus);
    assert.equal(errors.propertyStatus, undefined);
    assert.equal(errorsOf({ purpose: "Home Renovation", renovationStatus: "Planning Stage", ownership: "Self" }).renovationStatus, undefined);
  });

  test("balance transfer and other asks no status question", () => {
    assert.equal(getStageQuestion("Balance Transfer"), null);
    assert.equal(getStageQuestion("Other"), null);
    assert.equal(validatePropertyLoanForm({ ...valid(), purpose: "Balance Transfer", propertyStatus: "", ownership: "Self" }).isValid, true);
  });

  test("a stale status value from a different question is not accepted", () => {
    const errors = errorsOf({ purpose: "Home Construction", constructionStage: "Planning Stage", propertyStatus: "Identified Property", ownership: "Self" });
    assert.equal(errors.constructionStage, undefined);
    assert.equal(errors.propertyStatus, undefined);
    assert.ok(errorsOf({ purpose: "Home Construction", constructionStage: "Identified Property" as never, ownership: "Self" }).constructionStage);
  });

  test("ownership is required and 'Not Yet Purchased' only fits a purchase", () => {
    assert.ok(errorsOf({ ownership: "" }).ownership);
    assert.ok(errorsOf({ purpose: "Home Renovation", renovationStatus: "Planning Stage", ownership: "Not Yet Purchased" }).ownership);
    assert.equal(errorsOf({ ownership: "Not Yet Purchased" }).ownership, undefined);
    assert.equal(getOwnershipOptions("Home Renovation").includes("Not Yet Purchased"), false);
  });

  test("every canonical purpose can produce a valid application", () => {
    PROPERTY_PURPOSE_OPTIONS.forEach((purpose) => {
      const question = getStageQuestion(purpose);
      const form: PropertyLoanFormData = {
        ...valid(),
        purpose,
        purposeOther: purpose === "Other" ? "Farm house" : "",
        propertyStatus: "",
        ...(question ? { [question.field]: question.options[0] } : null),
      };
      assert.equal(validatePropertyLoanForm(form).isValid, true, purpose);
    });
  });
});

describe("property loan text and paste attacks", () => {
  beforeEach(() => useLoansStore.getState().resetAll());

  test("pasted money keeps whole rupees and never multiplies by 100", () => {
    const set = useLoansStore.getState().setPropertyField;
    set("requestedAmount", "₹25,00,000");
    assert.equal(useLoansStore.getState().propertyFormData.requestedAmount, "2500000");
    set("requestedAmount", "25,00,000");
    assert.equal(useLoansStore.getState().propertyFormData.requestedAmount, "2500000");
  });

  test("pasted PIN is reduced to at most six digits", () => {
    useLoansStore.getState().setPropertyField("pinCode", "50 00-81 99");
    assert.equal(useLoansStore.getState().propertyFormData.pinCode, "500081");
  });

  test("control characters become spaces and Unicode is preserved", () => {
    const set = useLoansStore.getState().setPropertyField;
    set("city", "Navi\nMumbai\t");
    assert.equal(useLoansStore.getState().propertyFormData.city, "Navi Mumbai ");
    set("city", "हैदराबाद");
    assert.equal(useLoansStore.getState().propertyFormData.city, "हैदराबाद");
    assert.equal(errorsOf({ city: "हैदराबाद" }).city, undefined);
    assert.equal(errorsOf({ city: "చెన్నై" }).city, undefined);
    assert.equal(errorsOf({ city: "O'Connor Nagar" }).city, undefined);
  });

  test("hostile text is stored as inert text and does not crash validation", () => {
    ["' OR 1=1 --", "<script>alert(1)</script>", "${process.env.SECRET}", "{{7*7}}", "a".repeat(10000)].forEach((text) => {
      const form = { ...valid(), purpose: "Other" as const, purposeOther: text, ownership: "Self" as const };
      assert.doesNotThrow(() => validatePropertyLoanForm(form));
    });
    assert.ok(errorsOf({ purpose: "Other", purposeOther: "a".repeat(500), ownership: "Self" }).purposeOther);
  });
});

describe("property loan state, flow and submission", () => {
  beforeEach(() => {
    useLoansStore.getState().resetAll();
    setLoanSubmissionService(localLoanSubmissionService);
  });

  test("switching purpose clears an ownership choice the new purpose does not allow", () => {
    const s = useLoansStore.getState();
    s.setPropertyField("purpose", "Home Purchase");
    s.setPropertyField("ownership", "Not Yet Purchased");
    useLoansStore.getState().setPropertyField("purpose", "Home Renovation");
    assert.equal(useLoansStore.getState().propertyFormData.ownership, "");
  });

  test("switching purpose keeps entered values but submits only the relevant question", () => {
    const form: PropertyLoanFormData = {
      ...valid(),
      propertyStatus: "Identified Property",
      constructionStage: "Planning Stage",
      renovationStatus: "Renovation Started",
    };
    const purchase = prunePropertyFormData(form);
    assert.equal(purchase.propertyStatus, "Identified Property");
    assert.equal(purchase.constructionStage, "");
    assert.equal(purchase.renovationStatus, "");
    const construction = prunePropertyFormData({ ...form, purpose: "Home Construction" });
    assert.equal(construction.constructionStage, "Planning Stage");
    assert.equal(construction.propertyStatus, "");
  });

  test("a specification is submitted only while 'Other' is selected", () => {
    const form: PropertyLoanFormData = { ...valid(), purposeOther: "Old text", propertyTypeOther: "Old type" };
    const pruned = prunePropertyFormData(form);
    assert.equal(pruned.purposeOther, "");
    assert.equal(pruned.propertyTypeOther, "");
    assert.equal(prunePropertyFormData({ ...form, propertyType: "Other" }).propertyTypeOther, "Old type");
  });

  test("the form survives going back and Review → Edit → Update", () => {
    const s = useLoansStore.getState();
    s.selectCategory(category);
    useLoansStore.setState({ propertyFormData: valid() });
    s.setDocumentAttachment("property_document", doc("property_document"));
    useLoansStore.getState().advanceTo("property-details");
    useLoansStore.getState().advanceTo("documents");
    useLoansStore.getState().retreatTo("property-details");
    assert.equal(useLoansStore.getState().propertyFormData.city, "Hyderabad");

    useLoansStore.getState().setActiveStep("review");
    useLoansStore.getState().editFromReview("property-details");
    assert.equal(useLoansStore.getState().returnToReview, true);
    useLoansStore.getState().setPropertyField("city", "Pune");
    assert.equal(useLoansStore.getState().validatePropertyForm(), true);
    useLoansStore.getState().advanceTo("documents");
    const after = useLoansStore.getState();
    assert.equal(after.activeStep, "review");
    assert.equal(after.returnToReview, false);
    assert.equal(after.propertyFormData.city, "Pune");
    assert.equal(after.propertyFormData.state, "Telangana");
    assert.ok(after.uploadedDocuments.property_document);
  });

  test("validation failure keeps the customer on the screen with field errors", () => {
    useLoansStore.getState().selectCategory(category);
    assert.equal(useLoansStore.getState().validatePropertyForm(), false);
    const errors = useLoansStore.getState().propertyErrors;
    assert.ok(errors.requestedAmount && errors.purpose && errors.propertyType && errors.city && errors.state && errors.pinCode);
    useLoansStore.getState().setPropertyField("city", "Pune");
    assert.equal(useLoansStore.getState().propertyErrors.city, undefined);
  });

  test("documents follow the purpose and come from the single resolver", () => {
    const business = createInitialBusinessFormData();
    const construction = resolveLoanDocumentRequirements({
      categoryId: "property-loan",
      businessFormData: business,
      propertyFormData: { ...valid(), purpose: "Home Construction" },
    });
    assert.ok(construction.some((d) => d.id === "property_ownership" && d.isMandatory));
    const renovation = resolveLoanDocumentRequirements({
      categoryId: "property-loan",
      businessFormData: business,
      propertyFormData: { ...valid(), purpose: "Home Renovation" },
    });
    assert.ok(renovation.some((d) => d.id === "renovation_estimate"));
    assert.ok(!renovation.some((d) => d.id === "building_plan"));
  });

  test("review shows only the applicable property fields", () => {
    const kyc = createInitialKycData();
    const sections = buildReviewSections(
      kyc,
      createInitialBusinessFormData(),
      undefined,
      "property-loan",
      undefined,
      { ...valid(), purpose: "Home Renovation", renovationStatus: "Planning Stage", ownership: "Self", propertyStatus: "Identified Property" }
    );
    const labels = sections.flatMap((section) => section.rows.map((row) => row.label));
    assert.ok(labels.includes("Renovation Status"));
    assert.ok(!labels.includes("Property Status"));
    assert.ok(labels.includes("PIN Code"));
    assert.ok(sections.every((s) => s.id === "applicant" || s.editTarget === "property-details"));
  });

  test("a property submission carries only property data and reaches Under Review", async () => {
    let captured: LoanSubmissionPayload | null = null;
    setLoanSubmissionService({
      submit: async (payload) => {
        captured = payload;
        return { applicationId: "TXE-LN-9", submittedAt: new Date().toISOString(), isSyncedToServer: false };
      },
    });
    useLoansStore.getState().selectCategory({ id: "business-loan", title: "Business", description: "", image: { uri: "t" } });
    useLoansStore.getState().setBusinessProfileField("businessName", "Old Business");
    seedApplication();
    useLoansStore.setState({
      propertyFormData: { ...valid(), constructionStage: "Planning Stage", purposeOther: "stale" },
    });
    assert.equal(await useLoansStore.getState().submitLoanApplication(), true);
    const sent = captured as LoanSubmissionPayload | null;
    assert.equal(sent?.categoryId, "property-loan");
    assert.equal(sent?.businessFormData.businessProfile.businessName, "");
    assert.equal(sent?.propertyFormData?.constructionStage, "");
    assert.equal(sent?.propertyFormData?.purposeOther, "");
    assert.equal(sent?.propertyFormData?.requestedAmount, "2500000");
    assert.equal(useLoansStore.getState().activeStep, "submitted");
    const summary = getSubmittedLoanSummary("property-loan", createInitialBusinessFormData(), "", "2500000");
    assert.equal(summary.label, "Property Loan");
    assert.equal(summary.amountRaw, "2500000");
  });

  test("review refuses an incomplete property application even if the screen was skipped", async () => {
    seedApplication();
    useLoansStore.setState({ propertyFormData: { ...valid(), pinCode: "12" } });
    assert.equal(await useLoansStore.getState().submitLoanApplication(), false);
    assert.ok(useLoansStore.getState().reviewErrors.property);
  });

  test("reset leaves no property data behind", () => {
    seedApplication();
    useLoansStore.getState().resetAll();
    assert.deepEqual(useLoansStore.getState().propertyFormData, createInitialPropertyFormData());
    assert.deepEqual(useLoansStore.getState().propertyErrors, {});
  });
});

describe("property loan screen source audit", () => {
  const files = [
    "property/screens/PropertyLoanScreen/PropertyLoanScreen.tsx",
    "property/components/PropertySections/PropertyRequirementSection.tsx",
    "property/components/PropertySections/PropertyDetailsSection.tsx",
    "property/components/PropertyTextField/PropertyTextField.tsx",
  ];
  const source = () => files.map(read).join("\n");

  test("asks nothing about credit, EMI, bank, income or business", () => {
    assert.ok(
      !/cibil|credit score|existing loan|emi|ifsc|account number|employer|turnover|gstin|udyam|employee/i.test(source())
    );
  });

  test("every selection uses the shared Dropdown and there are no popup selectors", () => {
    const code = source();
    assert.ok(code.includes('@/shared/components/Dropdown'));
    assert.ok(!/ActionSheet|<Modal|Picker|Alert\.alert/.test(code));
  });

  test("screen 2 repeats no KYC identity field and has no upload control", () => {
    const code = source();
    assert.ok(!/fullName|mobile|PAN|Aadhaar|dob|DocumentPicker|ImagePicker|DocumentUploadBottomSheet/i.test(code.replace(/PropertyType/g, "")));
  });

  test("layout uses the shared header, keyboard-aware scroller and sticky footer", () => {
    const screen = read(files[0]);
    assert.ok(screen.includes("LoanFlowHeader"));
    assert.ok(screen.includes("KeyboardAwareScrollView"));
    assert.ok(screen.includes("KeyboardStickyFooter"));
    assert.ok(screen.includes("isEditMode={isEditMode}"));
    assert.ok(screen.includes("getContinueLabel(isEditMode || isRevisit"));
    assert.ok(screen.includes('subtitle="Property & Loan Details"'));
    assert.ok(!/position:\s*"absolute"/.test(read("property/screens/PropertyLoanScreen/PropertyLoanScreen.styles.ts")));
  });

  test("no property file exceeds 400 lines", () => {
    const dir = path.join(process.cwd(), "src/modules/loans/property");
    const walk = (d: string): string[] =>
      fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]
      );
    walk(dir).forEach((file) => {
      assert.ok(fs.readFileSync(file, "utf8").split("\n").length <= 400, file);
    });
  });
});
