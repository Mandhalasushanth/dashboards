/// <reference types="node" />
import assert from "node:assert/strict";
import { test, describe, beforeEach } from "node:test";
import { useLoansStore } from "../../modules/loans/store/loansStore";
import { createInitialKycData } from "../../modules/loans/store/loansStore.types";
import {
  MAX_PERSONAL_LOAN_AMOUNT,
  MIN_PERSONAL_LOAN_AMOUNT,
  validatePersonalLoanForm,
} from "../../modules/loans/personalLoan/validation/personalLoanValidation";
import { getPersonalLoanDocuments } from "../../modules/loans/constants/loanDocuments";
import { validateLoanDocumentFile } from "../../modules/loans/validation/loanDocumentsValidation";
import { validateLoanKyc } from "../../modules/loans/validation/loanKycValidation";
import { loanKycService } from "../../modules/loans/services/loanKycService";
import { normalizeIndianMobile } from "../../modules/loans/utils/textInput";
import {
  localLoanSubmissionService,
  setLoanSubmissionService,
  type LoanSubmissionPayload,
} from "../../modules/loans/services/loanSubmissionService";
import type { PersonalLoanFormData } from "../../modules/loans/personalLoan/types/personalLoan.types";
import type { LoanDocumentUpload } from "../../modules/loans/types/loanReview.types";
import type { LoanKycData } from "../../modules/loans/types/loanKyc.types";

const personalCategory = {
  id: "personal-loan" as const,
  title: "Personal Loan",
  description: "Personal",
  image: { uri: "test" },
};

const businessCategory = {
  id: "business-loan" as const,
  title: "Business Loan",
  description: "Business",
  image: { uri: "test" },
};

const address = {
  houseNumber: "12-3",
  street: "MG Road",
  city: "Hyderabad",
  state: "Telangana",
  pincode: "500001",
};

const validKyc = (): LoanKycData => ({
  ...createInitialKycData(),
  fullName: "Anita Rao",
  mobile: "9876543210",
  dob: "15-08-1990",
  pan: "ABCPE1234F",
  currentAddress: address,
  consentGiven: true,
});

const validSalaried = (): PersonalLoanFormData => ({
  employmentType: "salaried",
  employerName: "Tata Consultancy Services",
  companyName: "Tata Consultancy Services",
  jobType: "Private",
  monthlyNetSalary: "75000",
  monthlySalary: "75000",
  workExperience: "3 - 5 years",
  salaryCreditMethod: "Bank Account",
  businessOrProfessionName: "",
  professionName: "",
  natureOfBusiness: "",
  averageMonthlyIncome: "",
  monthlyIncome: "",
  yearsInBusiness: "",
  loanAmount: "250000",
  requestedAmount: "250000",
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

const PAYLOADS = [
  "' OR 1=1 --",
  "<script>alert(1)</script>",
  "../../../../",
  "${process.env.SECRET}",
  "{{7*7}}",
  "null",
  "undefined",
  "NaN",
  "Infinity",
  "O'Connor & Sons",
  "A&B Traders",
  "back\\slash/forward",
  "ABC @#$%",
  "a".repeat(10000),
  "x\ny\tz",
  "  padded  ",
];

const UNICODE_NAMES = [
  "टाटा कंसल्टेंसी",
  "తెలుగు వ్యాపారం",
  "தமிழ் நிறுவனம்",
  "中文 公司",
  "🏢 ABC Enterprises",
  "ABC 🚀 Traders",
];

function setSalaried(overrides: Partial<PersonalLoanFormData>) {
  return { ...validSalaried(), ...overrides };
}

function seedPersonal() {
  const s = useLoansStore.getState();
  s.selectCategory(personalCategory);
  useLoansStore.setState({ kycData: validKyc(), personalFormData: validSalaried() });
  const docs = getPersonalLoanDocuments(validSalaried()).filter((d) => d.isMandatory);
  docs.forEach((d) => useLoansStore.getState().setDocumentAttachment(d.id, doc(d.id)));
  useLoansStore.getState().setReviewConsent(true);
}

describe("personal loan text attacks", () => {
  test("no hostile payload crashes validation and the verdict is deterministic", () => {
    PAYLOADS.forEach((payload) => {
      const a = validatePersonalLoanForm(setSalaried({ employerName: payload, companyName: payload }));
      const b = validatePersonalLoanForm(setSalaried({ employerName: payload, companyName: payload }));
      assert.deepEqual(a, b, payload.slice(0, 20));
    });
  });

  test("hostile text is kept as inert text, never rejected for being 'code-like'", () => {
    ["' OR 1=1 --", "<script>alert(1)</script>", "${process.env.SECRET}", "{{7*7}}", "O'Connor & Sons", "A&B Traders", "ABC @#$%", "null"].forEach((payload) => {
      const { errors } = validatePersonalLoanForm(setSalaried({ employerName: payload, companyName: payload }));
      assert.equal(errors.employerName, undefined, payload);
    });
  });

  test("Hindi, Telugu, Tamil, Chinese and emoji business names are accepted", () => {
    UNICODE_NAMES.forEach((name) => {
      const { errors } = validatePersonalLoanForm(setSalaried({ employerName: name, companyName: name }));
      assert.equal(errors.employerName, undefined, name);
    });
  });

  test("empty, whitespace-only, one-character and symbol-only names are rejected", () => {
    ["", "   ", "\t\n", "a", "😀", "!!", "---", "😀😀"].forEach((name) => {
      const { errors } = validatePersonalLoanForm(setSalaried({ employerName: name, companyName: name }));
      assert.ok(errors.employerName, JSON.stringify(name));
    });
  });

  test("a name longer than the input limit is rejected with a message", () => {
    const long = "a".repeat(10000);
    const { errors } = validatePersonalLoanForm(setSalaried({ employerName: long, companyName: long }));
    assert.match(errors.employerName ?? "", /80/);
  });

  test("the same rules apply to a self-employed business name", () => {
    const base: PersonalLoanFormData = {
      ...validSalaried(),
      employmentType: "self-employed",
      businessOrProfessionName: "",
      professionName: "",
      natureOfBusiness: "Trading",
      averageMonthlyIncome: "60000",
      monthlyIncome: "60000",
      yearsInBusiness: "3 - 5 years",
    };
    UNICODE_NAMES.forEach((name) => {
      const { errors } = validatePersonalLoanForm({ ...base, businessOrProfessionName: name, professionName: name });
      assert.equal(errors.businessOrProfessionName, undefined, name);
    });
    ["", "   ", "x", "😀"].forEach((name) => {
      const { errors } = validatePersonalLoanForm({ ...base, businessOrProfessionName: name, professionName: name });
      assert.ok(errors.businessOrProfessionName, JSON.stringify(name));
    });
  });

  test("newlines and tabs pasted into a single-line field become spaces", () => {
    useLoansStore.getState().resetAll();
    useLoansStore.getState().setPersonalLoanField("employerName", "Acme\nCorp\tLtd");
    assert.equal(useLoansStore.getState().personalFormData.employerName, "Acme Corp Ltd");
    assert.equal(useLoansStore.getState().personalFormData.companyName, "Acme Corp Ltd");
  });
});

describe("personal loan amount attacks", () => {
  const verdict = (amount: string) =>
    validatePersonalLoanForm(setSalaried({ loanAmount: amount, requestedAmount: amount })).errors.loanAmount;

  test("empty, zero, negative, non-numeric and below-minimum amounts are rejected", () => {
    ["", "   ", "0", "-5", "abc", "NaN", "Infinity", "1", "9999"].forEach((amount) => {
      assert.ok(verdict(amount), JSON.stringify(amount));
    });
  });

  test("the minimum and a normal amount are accepted", () => {
    assert.equal(verdict(String(MIN_PERSONAL_LOAN_AMOUNT)), undefined);
    assert.equal(verdict("250000"), undefined);
    assert.equal(verdict(String(MAX_PERSONAL_LOAN_AMOUNT)), undefined);
  });

  test("absurdly large amounts are rejected", () => {
    [String(MAX_PERSONAL_LOAN_AMOUNT + 1), "9".repeat(30), "99999999999999999999"].forEach((amount) => {
      assert.ok(verdict(amount), amount);
    });
  });

  test("scientific notation cannot sneak a tiny number past the minimum", () => {
    assert.ok(verdict("1e9"));
  });

  test("income and salary below the minimum, or non-numeric, are rejected", () => {
    ["", "5000", "abc", "0", "-50000", "50,000.75", "1e9", "50@000"].forEach((salary) => {
      const { errors } = validatePersonalLoanForm(setSalaried({ monthlyNetSalary: salary, monthlySalary: salary }));
      assert.ok(errors.monthlyNetSalary, JSON.stringify(salary));
    });
  });

  test("employment dropdown values are validated against the offered options", () => {
    const { errors } = validatePersonalLoanForm(
      setSalaried({
        jobType: "Unlisted Job",
        workExperience: "A lifetime",
      })
    );
    assert.ok(errors.jobType);
    assert.ok(errors.workExperience);
  });

  test("self-employed dropdown values are validated against the offered options", () => {
    const form = setSalaried({
      employmentType: "self-employed",
      natureOfBusiness: "Unlisted Industry",
      yearsInBusiness: "Forever",
      averageMonthlyIncome: "50000",
      monthlyIncome: "50000",
    });
    const { errors } = validatePersonalLoanForm(form);
    assert.ok(errors.natureOfBusiness);
    assert.ok(errors.yearsInBusiness);
  });
});

describe("common KYC attacks for personal loans", () => {
  const reqs = loanKycService.getProviderRequirements("personal-loan");
  const verdict = (patch: Partial<LoanKycData>) => validateLoanKyc({ ...validKyc(), ...patch }, reqs).errors;

  test("a valid applicant passes", () => {
    assert.equal(validateLoanKyc(validKyc(), reqs).isValid, true);
  });

  test("mobile numbers: leading zero, short, long, spaces and letters are rejected", () => {
    ["0123456789", "98765", "98765432101", "98765 43210", "abcdefghij", ""].forEach((mobile) => {
      assert.ok(verdict({ mobile }).mobile, JSON.stringify(mobile));
    });
  });

  test("mobile input accepts supported Indian prefixes without truncating invalid values", () => {
    for (const input of [
      "+91 98765 43210",
      "91 98765 43210",
      "09876543210",
      "98765 43210",
    ]) {
      const normalized = normalizeIndianMobile(input);
      assert.equal(normalized, "9876543210", input);
      assert.equal(verdict({ mobile: normalized }).mobile, undefined, input);
    }

    for (const input of [
      "98765432101",
      "+91 98765 432101",
      "9876543210abc",
      "+44 98765 43210",
    ]) {
      const normalized = normalizeIndianMobile(input);
      assert.equal(normalized, input, input);
      assert.ok(verdict({ mobile: normalized }).mobile, input);
    }
  });

  test("PAN: wrong shape, wrong category letter and empty are rejected", () => {
    ["ABCDE1234", "ABCDE12345", "12345ABCDE", "ABCDE1234F", ""].forEach((pan) => {
      assert.ok(verdict({ pan }).pan, JSON.stringify(pan));
    });
  });

  test("date of birth: impossible, future and under-18 dates are rejected", () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const tooYoung = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear() - 17}`;
    ["31-02-2000", "00-00-0000", "01-01-2999", "not-a-date", tooYoung, ""].forEach((dob) => {
      assert.ok(verdict({ dob }).dob, JSON.stringify(dob));
    });
  });

  test("PIN code: starts with zero, short or not numeric is rejected", () => {
    ["000000", "12345", "abcdef", "5000011"].forEach((pincode) => {
      assert.ok(verdict({ currentAddress: { ...address, pincode } })["currentAddress.pincode"], pincode);
    });
  });

  test("an absurdly long address line is rejected", () => {
    const errors = verdict({ currentAddress: { ...address, street: "s".repeat(5000) } });
    assert.ok(errors["currentAddress.street"]);
  });

  test("a stale Aadhaar from another application cannot block a personal application", () => {
    assert.equal(validateLoanKyc({ ...validKyc(), aadhaar: "123" }, reqs).isValid, true);
    const business = loanKycService.getProviderRequirements("business-loan");
    assert.ok(validateLoanKyc({ ...validKyc(), aadhaar: "123" }, business).errors.aadhaar);
  });

  test("consent is mandatory", () => {
    assert.ok(verdict({ consentGiven: false }).consentGiven);
  });

  test("an invalid optional email is rejected, a missing one is fine", () => {
    assert.ok(verdict({ email: "not-an-email" }).email);
    assert.equal(verdict({ email: "" }).email, undefined);
  });
});

describe("personal loan documents", () => {
  const bank = () => getPersonalLoanDocuments(validSalaried()).find((d) => d.id === "bank_statement");

  test("bank statement accepts a PDF, even when the picker reports a generic type or no extension", () => {
    const req = bank();
    assert.ok(req);
    const ok = [
      { uri: "u", name: "statement.pdf", size: 10, mimeType: "application/pdf" },
      { uri: "u", name: "STATEMENT.PDF", size: 10, mimeType: "application/pdf" },
      { uri: "u", name: "statement.pdf", size: 10, mimeType: "application/octet-stream" },
      { uri: "u", name: "statement", size: 10, mimeType: "application/pdf" },
      { uri: "u", name: "statement.pdf", size: 10 },
    ];
    ok.forEach((file) => assert.equal(validateLoanDocumentFile(file, req!), null, JSON.stringify(file)));
  });

  test("bank statement rejects images, renamed images, other documents and empty files", () => {
    const req = bank();
    const bad = [
      { uri: "u", name: "photo.jpg", size: 10, mimeType: "image/jpeg" },
      { uri: "u", name: "photo.png", size: 10, mimeType: "image/png" },
      { uri: "u", name: "photo.pdf", size: 10, mimeType: "image/jpeg" },
      { uri: "u", name: "statement.pdf.jpg", size: 10, mimeType: "application/pdf" },
      { uri: "u", name: "notes.docx", size: 10, mimeType: "application/msword" },
      { uri: "u", name: "statement.pdf", size: 0, mimeType: "application/pdf" },
      { uri: "u", name: "statement.pdf", size: 11 * 1024 * 1024, mimeType: "application/pdf" },
    ];
    bad.forEach((file) => assert.ok(validateLoanDocumentFile(file, req!), JSON.stringify(file)));
  });

  test("camera is unavailable for the bank statement only", () => {
    const docs = getPersonalLoanDocuments(validSalaried());
    assert.equal(docs.find((d) => d.id === "bank_statement")?.uploadSources.includes("camera"), false);
    assert.equal(docs.find((d) => d.id === "pan_card")?.uploadSources.includes("camera"), true);
  });

  test("requirement matrix follows salary credit method and employment type", () => {
    const mandatory = (patch: Partial<PersonalLoanFormData>) =>
      getPersonalLoanDocuments({ ...validSalaried(), ...patch }).find((d) => d.id === "bank_statement")?.isMandatory;
    assert.equal(mandatory({ salaryCreditMethod: "Bank Account" }), true);
    assert.equal(mandatory({ salaryCreditMethod: "Cash" }), false);
    assert.equal(mandatory({ salaryCreditMethod: "Cheque" }), false);
    assert.equal(mandatory({ employmentType: "self-employed" }), false);
    const itr = getPersonalLoanDocuments({ ...validSalaried(), employmentType: "self-employed" }).find((d) => d.id === "itr_acknowledgment");
    assert.equal(itr?.isMandatory, false);
    assert.equal(getPersonalLoanDocuments(validSalaried()).some((d) => d.id === "itr_acknowledgment"), false);
  });
});

describe("personal loan state and submission", () => {
  beforeEach(() => {
    useLoansStore.getState().resetAll();
    setLoanSubmissionService(localLoanSubmissionService);
  });

  test("documents and consent never leak from one loan type into another", () => {
    const s = useLoansStore.getState();
    s.selectCategory(businessCategory);
    s.setDocumentAttachment("bank_statement", doc("bank_statement", "statement.jpg"));
    s.setReviewConsent(true);
    useLoansStore.getState().selectCategory(personalCategory);
    const after = useLoansStore.getState();
    assert.deepEqual(after.uploadedDocuments, {});
    assert.equal(after.isReviewConsentGiven, false);
    assert.deepEqual(after.reviewErrors, {});
  });

  test("re-selecting the same loan type keeps the work in progress", () => {
    const s = useLoansStore.getState();
    s.selectCategory(personalCategory);
    s.setDocumentAttachment("pan_card", doc("pan_card"));
    useLoansStore.getState().selectCategory(personalCategory);
    assert.ok(useLoansStore.getState().uploadedDocuments.pan_card);
  });

  test("review blocks a salary below the minimum even if the screen check was bypassed", async () => {
    seedPersonal();
    useLoansStore.setState({ personalFormData: { ...validSalaried(), monthlyNetSalary: "5", monthlySalary: "5" } });
    assert.equal(await useLoansStore.getState().submitLoanApplication(), false);
    assert.ok(useLoansStore.getState().reviewErrors.employment);
    assert.equal(useLoansStore.getState().submittedApplicationId, null);
  });

  test("review blocks incomplete KYC (missing PAN, DOB or consent)", async () => {
    seedPersonal();
    useLoansStore.setState({ kycData: { ...validKyc(), pan: "", dob: "", consentGiven: false } });
    assert.equal(await useLoansStore.getState().submitLoanApplication(), false);
    assert.ok(useLoansStore.getState().reviewErrors.applicant);
  });

  test("review blocks a missing or absurd loan amount", async () => {
    seedPersonal();
    useLoansStore.setState({ personalFormData: { ...validSalaried(), loanAmount: "", requestedAmount: "" } });
    assert.equal(await useLoansStore.getState().submitLoanApplication(), false);
    assert.ok(useLoansStore.getState().reviewErrors.loan);
  });

  test("a personal submission carries no business data and no inactive employment fields", async () => {
    let captured: LoanSubmissionPayload | null = null;
    setLoanSubmissionService({
      submit: async (payload) => {
        captured = payload;
        return { applicationId: "TXE-LN-1", submittedAt: new Date().toISOString(), isSyncedToServer: false };
      },
    });
    // Leftover business application data, then a personal application.
    useLoansStore.getState().selectCategory(businessCategory);
    useLoansStore.getState().setBusinessProfileField("businessName", "Old Business Pvt Ltd");
    useLoansStore.getState().setBusinessLoanField("loanAmount", "9000000");
    seedPersonal();
    useLoansStore.setState({
      personalFormData: { ...validSalaried(), businessOrProfessionName: "Stale Shop", professionName: "Stale Shop", averageMonthlyIncome: "999999", monthlyIncome: "999999" },
    });
    assert.equal(await useLoansStore.getState().submitLoanApplication(), true);
    const sent = captured as LoanSubmissionPayload | null;
    assert.equal(sent?.categoryId, "personal-loan");
    assert.equal(sent?.businessFormData.businessProfile.businessName, "");
    assert.equal(sent?.businessFormData.businessLoan.loanAmount, "");
    assert.equal(sent?.personalFormData?.businessOrProfessionName, "");
    assert.equal(sent?.personalFormData?.averageMonthlyIncome, "");
    assert.equal(sent?.personalFormData?.employerName, "Tata Consultancy Services");
    assert.equal(sent?.kycData.aadhaar, "");
    assert.equal(sent?.documents.every((d) => ["pan_card", "bank_statement"].includes(d.documentId)), true);
  });

  test("returning to review after an edit clears errors from the earlier failed attempt", async () => {
    seedPersonal();
    useLoansStore.setState({ personalFormData: { ...validSalaried(), loanAmount: "", requestedAmount: "" } });
    await useLoansStore.getState().submitLoanApplication();
    assert.ok(useLoansStore.getState().reviewErrors.loan);
    useLoansStore.getState().editFromReview("personal-employment");
    useLoansStore.getState().setPersonalLoanField("loanAmount", "250000");
    useLoansStore.getState().advanceTo("documents");
    const s = useLoansStore.getState();
    assert.equal(s.activeStep, "review");
    assert.equal(s.reviewErrors.loan, undefined);
    assert.equal(await useLoansStore.getState().submitLoanApplication(), true);
  });

  test("a second tap while submitting does not submit twice", async () => {
    seedPersonal();
    let calls = 0;
    setLoanSubmissionService({
      submit: async () => {
        calls += 1;
        return { applicationId: "TXE-LN-2", submittedAt: new Date().toISOString(), isSyncedToServer: false };
      },
    });
    const first = useLoansStore.getState().submitLoanApplication();
    const second = useLoansStore.getState().submitLoanApplication();
    assert.equal(await second, false);
    assert.equal(await first, true);
    assert.equal(calls, 1);
  });

  test("reset after a submission leaves no personal data behind", async () => {
    seedPersonal();
    await useLoansStore.getState().submitLoanApplication();
    useLoansStore.getState().resetAll();
    const s = useLoansStore.getState();
    assert.equal(s.personalFormData.employerName, "");
    assert.equal(s.personalFormData.loanAmount, "");
    assert.equal(s.kycData.fullName, "");
    assert.deepEqual(s.uploadedDocuments, {});
    assert.equal(s.submittedApplicationId, null);
  });
});
