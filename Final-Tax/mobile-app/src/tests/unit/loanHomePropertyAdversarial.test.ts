/// <reference types="node" />
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test, describe, beforeEach } from "node:test";
import { useLoansStore } from "../../modules/loans/store/loansStore";
import {
  createInitialBusinessFormData,
  createInitialHomeLoanFormData,
  createInitialKycData,
} from "../../modules/loans/store/loansStore.types";
import { validateHomeLoanRequirementForm } from "../../modules/loans/homeLoan/validation/homeLoanValidation";
import type { HomeLoanRequirementFormData } from "../../modules/loans/homeLoan/types/homeLoan.types";
import {
  createInitialPropertyFormData,
  type PropertyLoanFormData,
} from "../../modules/loans/property/types/property.types";
import { resolveLoanDocumentRequirements } from "../../modules/loans/constants/loanDocumentResolver";
import { getSubmittedLoanSummary } from "../../modules/loans/utils/loanReviewSummary";
import {
  localLoanSubmissionService,
  setLoanSubmissionService,
  type LoanSubmissionPayload,
} from "../../modules/loans/services/loanSubmissionService";
import type { LoanDocumentUpload } from "../../modules/loans/types/loanReview.types";

const homeCategory = { id: "home-loan" as const, title: "Home Loan", description: "", image: { uri: "t" } };
const propertyCategory = { id: "property-loan" as const, title: "Property Loan", description: "", image: { uri: "t" } };
const businessCategory = { id: "business-loan" as const, title: "Business", description: "", image: { uri: "t" } };

const homeForm = (): HomeLoanRequirementFormData => ({
  ...createInitialHomeLoanFormData(),
  loanAmount: "2500000",
  requestedAmount: "2500000",
  purpose: "Purchase a New Home",
  propertyStatus: "Property Identified",
  approximatePropertyValue: "4000000",
  propertyValue: "4000000",
});

const propertyForm = (): PropertyLoanFormData => ({
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

const kyc = () => ({
  ...createInitialKycData(),
  fullName: "Anita Rao",
  mobile: "9876543210",
  consentGiven: true,
  currentAddress: { houseNumber: "1", street: "MG Road", city: "Hyderabad", state: "Telangana", pincode: "500001" },
});

const doc = (id: string, name = `${id}.pdf`): LoanDocumentUpload => ({
  id: `${id}_1`,
  documentId: id,
  fileName: name,
  fileUri: `file:///${name}`,
  fileSize: 100,
  mimeType: "application/pdf",
  status: "selected",
});

function uploadMandatory() {
  const s = useLoansStore.getState();
  resolveLoanDocumentRequirements({
    categoryId: s.selectedCategory?.id,
    businessFormData: s.businessFormData,
    personalFormData: s.personalFormData,
    homeLoanFormData: s.homeLoanFormData,
    propertyFormData: s.propertyFormData,
  })
    .filter((d) => d.isMandatory)
    .forEach((d) => useLoansStore.getState().setDocumentAttachment(d.id, doc(d.id)));
  useLoansStore.getState().setReviewConsent(true);
}

function seedHome() {
  useLoansStore.getState().selectCategory(homeCategory);
  useLoansStore.setState({ kycData: kyc(), homeLoanFormData: homeForm() });
  uploadMandatory();
}

function seedProperty() {
  useLoansStore.getState().selectCategory(propertyCategory);
  useLoansStore.setState({ kycData: kyc(), propertyFormData: propertyForm() });
  uploadMandatory();
}

function capture(): { sent: () => LoanSubmissionPayload | null } {
  let payload: LoanSubmissionPayload | null = null;
  setLoanSubmissionService({
    submit: async (p) => {
      payload = p;
      return { applicationId: "TXE-LN-7", submittedAt: new Date().toISOString(), isSyncedToServer: false };
    },
  });
  return { sent: () => payload };
}

const homeErrors = (patch: Partial<HomeLoanRequirementFormData>) =>
  validateHomeLoanRequirementForm({ ...homeForm(), ...patch }).errors;

const read = (file: string) =>
  fs.readFileSync(path.join(process.cwd(), "src/modules/loans", file), "utf8");

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
  );

describe("home loan amount attacks", () => {
  test("empty, zero, symbols, scientific notation and negatives are rejected", () => {
    ["", "   ", "0", "abc", "1e9", "1e10", "NaN", "Infinity", "-5", "12abc"].forEach((amount) => {
      assert.ok(homeErrors({ loanAmount: amount, requestedAmount: amount }).loanAmount, JSON.stringify(amount));
      assert.ok(
        homeErrors({ approximatePropertyValue: amount, propertyValue: amount }).approximatePropertyValue,
        JSON.stringify(amount)
      );
    });
  });

  test("decimals are refused with a clear message and never reinterpreted", () => {
    assert.equal(homeErrors({ loanAmount: "50000.75", requestedAmount: "50000.75" }).loanAmount, "Enter whole rupees without paise.");
  });

  test("amounts longer than the money input can hold are rejected", () => {
    const huge = "9".repeat(40);
    assert.ok(homeErrors({ loanAmount: huge, requestedAmount: huge }).loanAmount);
    assert.equal(homeErrors({ loanAmount: "99,99,99,999", requestedAmount: "99,99,99,999" }).loanAmount, undefined);
  });

  test("valid formatted money is normalized and malformed money is preserved for validation", () => {
    const set = useLoansStore.getState().setHomeLoanField;
    set("loanAmount", "50,000.75");
    assert.equal(useLoansStore.getState().homeLoanFormData.loanAmount, "50,000.75");
    assert.equal(useLoansStore.getState().homeLoanFormData.requestedAmount, "50,000.75");
    set("approximatePropertyValue", "₹1,00,00,000");
    assert.equal(useLoansStore.getState().homeLoanFormData.approximatePropertyValue, "10000000");
    assert.equal(useLoansStore.getState().homeLoanFormData.propertyValue, "10000000");
    set("loanAmount", "1e9");
    assert.equal(useLoansStore.getState().homeLoanFormData.loanAmount, "1e9");
  });

  test("purpose and status must be one of the offered options", () => {
    ["", "   ", "' OR 1=1 --", "<script>alert(1)</script>", "Property Identified"].forEach((purpose) => {
      assert.ok(homeErrors({ purpose: purpose as never }).purpose, JSON.stringify(purpose));
    });
    ["", "Purchase a New Home", "{{7*7}}"].forEach((status) => {
      assert.ok(homeErrors({ propertyStatus: status as never }).propertyStatus, JSON.stringify(status));
    });
  });
});

describe("property loan money and PIN attacks through the store", () => {
  beforeEach(() => useLoansStore.getState().resetAll());

  test("pasted formatted amounts never turn into larger numbers", () => {
    const set = useLoansStore.getState().setPropertyField;
    const cases: [string, string][] = [
      ["50,000.75", "50,000.75"],
      ["₹0", "0"],
      ["99,99,99,999", "999999999"],
      ["1,00,000", "100000"],
      ["1.2.3", "1.2.3"],
      [" 1 000 ", "1 000"],
    ];
    cases.forEach(([input, expected]) => {
      set("requestedAmount", input);
      assert.equal(useLoansStore.getState().propertyFormData.requestedAmount, expected, input);
    });
  });

  test("PIN paste keeps six digits and city keeps Indian-language text", () => {
    useLoansStore.getState().setPropertyField("pinCode", "5 6 0-0 0 1 9");
    assert.equal(useLoansStore.getState().propertyFormData.pinCode, "560001");
    ["சென்னை", "హైదరాబాద్", "पुणे", "Bengaluru"].forEach((city) => {
      useLoansStore.getState().setPropertyField("city", city);
      assert.equal(useLoansStore.getState().propertyFormData.city, city);
    });
  });
});

describe("cross-loan data leakage", () => {
  beforeEach(() => {
    useLoansStore.getState().resetAll();
    setLoanSubmissionService(localLoanSubmissionService);
  });

  test("home → property: no home document or consent carries over, property payload has no home data", async () => {
    seedHome();
    useLoansStore.getState().selectCategory(propertyCategory);
    const afterSwitch = useLoansStore.getState();
    assert.deepEqual(afterSwitch.uploadedDocuments, {});
    assert.equal(afterSwitch.isReviewConsentGiven, false);

    const spy = capture();
    useLoansStore.setState({ kycData: kyc(), propertyFormData: propertyForm() });
    uploadMandatory();
    assert.equal(await useLoansStore.getState().submitLoanApplication(), true);
    const sent = spy.sent();
    assert.equal(sent?.categoryId, "property-loan");
    assert.equal(sent?.homeLoanFormData, undefined);
    assert.equal(sent?.personalFormData, undefined);
    assert.equal(sent?.businessFormData.businessProfile.businessName, "");
  });

  test("property → home: no property document carries over, home payload has no property data", async () => {
    seedProperty();
    useLoansStore.getState().selectCategory(homeCategory);
    assert.deepEqual(useLoansStore.getState().uploadedDocuments, {});

    const spy = capture();
    useLoansStore.setState({ kycData: kyc(), homeLoanFormData: homeForm() });
    uploadMandatory();
    assert.equal(await useLoansStore.getState().submitLoanApplication(), true);
    const sent = spy.sent();
    assert.equal(sent?.categoryId, "home-loan");
    assert.equal(sent?.propertyFormData, undefined);
    assert.equal(sent?.homeLoanFormData?.loanAmount, "2500000");
  });

  test("a leftover business application never appears in a home or property payload", async () => {
    useLoansStore.getState().selectCategory(businessCategory);
    useLoansStore.getState().setBusinessProfileField("businessName", "Old Business Pvt Ltd");
    useLoansStore.getState().setBusinessLoanField("loanAmount", "9000000");
    const spy = capture();
    seedHome();
    assert.equal(await useLoansStore.getState().submitLoanApplication(), true);
    const sent = spy.sent();
    assert.equal(sent?.businessFormData.businessProfile.businessName, "");
    assert.equal(sent?.businessFormData.businessLoan.loanAmount, "");
  });

  test("documents uploaded for one purpose do not satisfy or ride along with another", async () => {
    seedHome();
    useLoansStore.getState().setDocumentAttachment("property_ownership", doc("property_ownership"));
    useLoansStore.getState().setHomeLoanField("purpose", "Balance Transfer");
    const requirements = resolveLoanDocumentRequirements({
      categoryId: "home-loan",
      businessFormData: createInitialBusinessFormData(),
      homeLoanFormData: useLoansStore.getState().homeLoanFormData,
    });
    assert.ok(requirements.some((d) => d.id === "existing_loan_statement" && d.isMandatory));
    assert.equal(await useLoansStore.getState().submitLoanApplication(), false);
    assert.ok(useLoansStore.getState().reviewErrors.documents?.existing_loan_statement);

    const spy = capture();
    useLoansStore.getState().setDocumentAttachment("existing_loan_statement", doc("existing_loan_statement"));
    assert.equal(await useLoansStore.getState().submitLoanApplication(), true);
    const ids = spy.sent()?.documents.map((d) => d.documentId) ?? [];
    assert.ok(ids.includes("existing_loan_statement"));
    assert.ok(!ids.includes("property_ownership"));
  });

  test("property purpose changes recalculate documents and drop inactive answers from the payload", async () => {
    seedProperty();
    useLoansStore.getState().setPropertyField("constructionStage", "Planning Stage");
    useLoansStore.getState().setPropertyField("purposeOther", "ghost");
    useLoansStore.getState().setPropertyField("purpose", "Home Construction");
    useLoansStore.getState().setPropertyField("ownership", "Self");
    const spy = capture();
    useLoansStore.getState().setDocumentAttachment("property_ownership", doc("property_ownership"));
    assert.equal(await useLoansStore.getState().submitLoanApplication(), true);
    const sent = spy.sent()?.propertyFormData;
    assert.equal(sent?.constructionStage, "Planning Stage");
    assert.equal(sent?.propertyStatus, "");
    assert.equal(sent?.purposeOther, "");
  });
});

describe("review cannot be bypassed", () => {
  beforeEach(() => {
    useLoansStore.getState().resetAll();
    setLoanSubmissionService(localLoanSubmissionService);
  });

  const submit = () => useLoansStore.getState().submitLoanApplication();

  test("home: missing consent, bad PAN, bad DOB and missing KYC are blocked", async () => {
    seedHome();
    useLoansStore.setState({ kycData: { ...kyc(), consentGiven: false } });
    assert.equal(await submit(), false);
    assert.ok(useLoansStore.getState().reviewErrors.applicant);

    useLoansStore.setState({ kycData: { ...kyc(), pan: "NOTAPAN123" } });
    assert.equal(await submit(), false);

    useLoansStore.setState({ kycData: { ...kyc(), dob: "31-02-2000" } });
    assert.equal(await submit(), false);

    useLoansStore.setState({ kycData: { ...kyc(), fullName: "", mobile: "" } });
    assert.equal(await submit(), false);
  });

  test("property: the same KYC bypasses are blocked", async () => {
    seedProperty();
    useLoansStore.setState({ kycData: { ...kyc(), consentGiven: false } });
    assert.equal(await submit(), false);
    useLoansStore.setState({ kycData: { ...kyc(), pan: "NOTAPAN123" } });
    assert.equal(await submit(), false);
    useLoansStore.setState({ kycData: { ...kyc(), dob: "01-01-2999" } });
    assert.equal(await submit(), false);
  });

  test("home: incomplete or invalid loan details are blocked even if the screen was skipped", async () => {
    seedHome();
    const bad: Partial<HomeLoanRequirementFormData>[] = [
      { loanAmount: "", requestedAmount: "" },
      { loanAmount: "0", requestedAmount: "0" },
      { loanAmount: "-2500000", requestedAmount: "-2500000" },
      { loanAmount: "25,,00,000", requestedAmount: "25,,00,000" },
      { loanAmount: "1e9", requestedAmount: "1e9" },
      { purpose: "" },
      { propertyStatus: "" },
      { approximatePropertyValue: "", propertyValue: "" },
    ];
    for (const patch of bad) {
      useLoansStore.setState({ homeLoanFormData: { ...homeForm(), ...patch } });
      assert.equal(await submit(), false, JSON.stringify(patch));
      assert.ok(useLoansStore.getState().reviewErrors.loan, JSON.stringify(patch));
    }
  });

  test("property: incomplete or invalid details are blocked", async () => {
    seedProperty();
    const bad: Partial<PropertyLoanFormData>[] = [
      { requestedAmount: "" },
      { requestedAmount: "0" },
      { requestedAmount: "-500000" },
      { requestedAmount: "5,,00,000" },
      { purpose: "" },
      { propertyType: "" },
      { city: "" },
      { state: "Atlantis" },
      { pinCode: "000000" },
      { propertyStatus: "" },
      { ownership: "" },
      { propertyType: "Other", propertyTypeOther: "" },
    ];
    for (const patch of bad) {
      useLoansStore.setState({ propertyFormData: { ...propertyForm(), ...patch } });
      assert.equal(await submit(), false, JSON.stringify(patch));
    }
  });

  test("hidden stale fields never block a valid application", async () => {
    seedProperty();
    useLoansStore.setState({
      propertyFormData: { ...propertyForm(), constructionStage: "Planning Stage", renovationStatus: "Planning Stage", purposeOther: "x".repeat(500), propertyTypeOther: "<b>" },
    });
    assert.equal(await submit(), true);
  });

  test("missing mandatory documents are blocked for both loans", async () => {
    seedHome();
    useLoansStore.setState({ uploadedDocuments: {} });
    assert.equal(await submit(), false);
    assert.ok(Object.keys(useLoansStore.getState().reviewErrors.documents ?? {}).length > 0);
    useLoansStore.getState().resetAll();
    seedProperty();
    useLoansStore.setState({ uploadedDocuments: {} });
    assert.equal(await submit(), false);
  });
});

describe("under review summary", () => {
  test("each loan shows its own name and amount, never a leftover from another loan", () => {
    const business = createInitialBusinessFormData();
    assert.deepEqual(getSubmittedLoanSummary("home-loan", business, "111", "222", "333"), { label: "Home Loan", amountRaw: "333" });
    assert.deepEqual(getSubmittedLoanSummary("property-loan", business, "111", "222", "333"), { label: "Property Loan", amountRaw: "222" });
    assert.deepEqual(getSubmittedLoanSummary("personal-loan", business, "111", "222", "333"), { label: "Personal Loan", amountRaw: "111" });
    assert.equal(getSubmittedLoanSummary("vehicle-loan", business, undefined, undefined, undefined, "444").amountRaw, "444");
  });

  test("one shared Under Review exists and loan folders do not define their own", () => {
    const root = path.join(process.cwd(), "src/modules/loans");
    ["homeLoan", "property", "personalLoan"].forEach((folder) => {
      walk(path.join(root, folder)).forEach((file) => {
        assert.ok(!/UnderReview/i.test(path.basename(file)), file);
      });
    });
    const screen = read("screens/LoanUnderReviewScreen/LoanUnderReviewScreen.tsx");
    assert.ok(screen.includes("@/shared/components/ApplicationUnderReview"));
    const shared = fs.readFileSync(path.join(process.cwd(), "src/shared/components/ApplicationUnderReview/ApplicationUnderReview.tsx"), "utf8");
    assert.ok(!/approved|sanction|eligible|guarantee|disburs/i.test(shared));
  });
});

describe("home and property source audit", () => {
  const folders = ["homeLoan", "property"];
  const sources = () =>
    folders.flatMap((folder) =>
      walk(path.join(process.cwd(), "src/modules/loans", folder)).filter((f) => /\.tsx?$/.test(f))
    );

  test("no alternate selectors: single-selection fields use the shared Dropdown", () => {
    sources().forEach((file) => {
      const code = fs.readFileSync(file, "utf8");
      assert.ok(!/ActionSheet|<Modal|@react-native-picker|<Picker|RadioGroup|Alert\.alert/.test(code), file);
    });
  });

  test("no unsafe or debugging constructs", () => {
    sources().forEach((file) => {
      const code = fs.readFileSync(file, "utf8");
      assert.ok(!/@ts-ignore|@ts-nocheck|eslint-disable|console\.(log|warn|error)|setTimeout|: any\b|as any\b/.test(code), file);
      assert.ok(!/\b(for|while)\s*\(|\bdo\s*\{/.test(code), file);
    });
  });

  test("no file in either folder exceeds 400 lines", () => {
    sources().forEach((file) => {
      assert.ok(fs.readFileSync(file, "utf8").split("\n").length <= 400, file);
    });
  });

  test("Review is read-only: it imports no picker and no upload controls", () => {
    const code = [
      "screens/LoanReviewScreen/LoanReviewScreen.tsx",
      "components/ReviewDocumentsSummary/ReviewDocumentsSummary.tsx",
      "components/ApplicationSummarySection/ApplicationSummarySection.tsx",
    ].map(read).join("\n");
    assert.ok(!/DocumentPicker|ImagePicker|DocumentUploadBottomSheet|useLoanDocumentUpload|setDocumentAttachment/.test(code));
  });

  test("home and property ask nothing about credit, EMI or bank accounts", () => {
    // Document names (e.g. a balance-transfer loan statement) are requests for a file, not questions.
    const code = sources()
      .filter((file) => !file.includes(`${path.sep}constants${path.sep}`))
      .map((file) => fs.readFileSync(file, "utf8"))
      .join("\n");
    assert.ok(!/cibil|credit score|existing loan|emi\b|ifsc|account number/i.test(code));
  });
});
