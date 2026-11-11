/// <reference types="node" />
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test, describe, beforeEach } from "node:test";
import { useLoansStore } from "../../modules/loans/store/loansStore";
import { validateBusinessLoanForm } from "../../modules/loans/businessWorkingCapital/validation/businessLoanValidation";
import { validatePersonalLoanForm } from "../../modules/loans/personalLoan/validation/personalLoanValidation";
import {
  JOB_TYPE_OPTIONS,
  SALARY_CREDIT_METHOD_OPTIONS,
  WORK_EXPERIENCE_OPTIONS,
  NATURE_OF_BUSINESS_OPTIONS,
  YEARS_IN_BUSINESS_OPTIONS,
} from "../../modules/loans/personalLoan/types/personalLoan.types";

describe("Loans UI Architecture: Dropdown Audit Suite", () => {
  beforeEach(() => {
    useLoansStore.getState().resetAll();
  });

  test("1. Every predefined selection field in Business & Working Capital uses Dropdown", () => {
    const commonPath = path.join(
      process.cwd(),
      "src/modules/loans/businessWorkingCapital/components/CommonBusinessProfileSection/CommonBusinessProfileSection.tsx"
    );
    const commonCode = fs.readFileSync(commonPath, "utf8");
    assert.ok(commonCode.includes('import { Dropdown } from "@/shared/components/Dropdown"'));
    assert.ok(commonCode.includes('label="Business Constitution"'));
    assert.ok(commonCode.includes('label="Primary Business Activity"'));

    const blPath = path.join(
      process.cwd(),
      "src/modules/loans/businessWorkingCapital/components/DynamicBusinessLoanSection/DynamicBusinessLoanSection.tsx"
    );
    const blCode = fs.readFileSync(blPath, "utf8");
    assert.ok(blCode.includes('import { Dropdown } from "@/shared/components/Dropdown"'));
    assert.ok(blCode.includes('label="Purpose of Loan"'));

    const wcPath = path.join(
      process.cwd(),
      "src/modules/loans/businessWorkingCapital/components/DynamicWorkingCapitalSection/DynamicWorkingCapitalSection.tsx"
    );
    const wcCode = fs.readFileSync(wcPath, "utf8");
    assert.ok(wcCode.includes('import { Dropdown } from "@/shared/components/Dropdown"'));
    assert.ok(wcCode.includes('label="Purpose of Funds"'));
  });

  test("2. Every predefined selection field in Personal Loan uses Dropdown", () => {
    const salariedPath = path.join(
      process.cwd(),
      "src/modules/loans/personalLoan/components/PersonalIncomeSections/PersonalSalariedSection.tsx"
    );
    const salariedCode = fs.readFileSync(salariedPath, "utf8");
    assert.ok(salariedCode.includes('import { Dropdown } from "@/shared/components/Dropdown"'));
    assert.ok(salariedCode.includes('label="Job Type"'));
    assert.ok(salariedCode.includes('label="Work Experience"'));
    assert.ok(salariedCode.includes('label="How do you receive your salary?"'));

    const selfPath = path.join(
      process.cwd(),
      "src/modules/loans/personalLoan/components/PersonalIncomeSections/PersonalSelfEmployedSection.tsx"
    );
    const selfCode = fs.readFileSync(selfPath, "utf8");
    assert.ok(selfCode.includes('import { Dropdown } from "@/shared/components/Dropdown"'));
    assert.ok(selfCode.includes('label="Nature of Business / Profession"'));
    assert.ok(selfCode.includes('label="Years in Business"'));
  });

  test("3. Address State selection in KYC uses Dropdown", () => {
    const addressPath = path.join(
      process.cwd(),
      "src/modules/loans/components/AddressSection/AddressSection.tsx"
    );
    const addressCode = fs.readFileSync(addressPath, "utf8");
    assert.ok(addressCode.includes('import { Dropdown } from "@/shared/components/Dropdown"'));
    assert.ok(addressCode.includes('label="State"'));
  });

  test("4. No obsolete popup or modal option selectors exist in loans screens", () => {
    const screens = [
      "src/modules/loans/businessWorkingCapital/screens/BusinessLoanScreen/BusinessLoanScreen.tsx",
      "src/modules/loans/personalLoan/screens/PersonalLoanScreen/PersonalLoanScreen.tsx",
      "src/modules/loans/screens/LoanKycScreen/LoanKycScreen.tsx",
      "src/modules/loans/businessWorkingCapital/components/CommonBusinessProfileSection/CommonBusinessProfileSection.tsx",
      "src/modules/loans/businessWorkingCapital/components/DynamicBusinessLoanSection/DynamicBusinessLoanSection.tsx",
      "src/modules/loans/businessWorkingCapital/components/DynamicWorkingCapitalSection/DynamicWorkingCapitalSection.tsx",
      "src/modules/loans/personalLoan/components/PersonalIncomeSections/PersonalSalariedSection.tsx",
      "src/modules/loans/personalLoan/components/PersonalIncomeSections/PersonalSelfEmployedSection.tsx",
    ];

    screens.forEach((rel) => {
      const code = fs.readFileSync(path.join(process.cwd(), rel), "utf8");
      // Must not contain obsolete popup dialogs or action sheet option pickers
      assert.ok(!code.includes("ActionSheet"));
      assert.ok(!code.includes("PopupPicker"));
      assert.ok(!code.includes("SelectModal"));
      assert.ok(!code.includes("OptionSelector"));
    });
  });

  test("5. Selected dropdown values are correctly stored in Zustand state", () => {
    const store = useLoansStore.getState();

    // Business dropdowns
    store.setBusinessProfileField("constitution", "Partnership");
    store.setBusinessProfileField("businessActivity", "Manufacturing");
    store.setBusinessLoanField("purpose", "Equipment Purchase");
    store.setWorkingCapitalField("purpose", "Supplier Payments");

    let s = useLoansStore.getState();
    assert.equal(s.businessFormData.businessProfile.constitution, "Partnership");
    assert.equal(s.businessFormData.businessProfile.businessActivity, "Manufacturing");
    assert.equal(s.businessFormData.businessLoan.purpose, "Equipment Purchase");
    assert.equal(s.businessFormData.workingCapital.purpose, "Supplier Payments");

    // Personal salaried dropdowns
    store.setPersonalEmploymentType("salaried");
    store.setPersonalLoanField("jobType", JOB_TYPE_OPTIONS[0]);
    store.setPersonalLoanField("workExperience", WORK_EXPERIENCE_OPTIONS[1]);
    store.setPersonalLoanField("salaryCreditMethod", SALARY_CREDIT_METHOD_OPTIONS[0]);

    s = useLoansStore.getState();
    assert.equal(s.personalFormData.jobType, JOB_TYPE_OPTIONS[0]);
    assert.equal(s.personalFormData.workExperience, WORK_EXPERIENCE_OPTIONS[1]);
    assert.equal(s.personalFormData.salaryCreditMethod, SALARY_CREDIT_METHOD_OPTIONS[0]);

    // Personal self-employed dropdowns
    store.setPersonalEmploymentType("self-employed");
    store.setPersonalLoanField("natureOfBusiness", NATURE_OF_BUSINESS_OPTIONS[0]);
    store.setPersonalLoanField("yearsInBusiness", YEARS_IN_BUSINESS_OPTIONS[1]);

    s = useLoansStore.getState();
    assert.equal(s.personalFormData.natureOfBusiness, NATURE_OF_BUSINESS_OPTIONS[0]);
    assert.equal(s.personalFormData.yearsInBusiness, YEARS_IN_BUSINESS_OPTIONS[1]);
  });

  test("6. Switching loan types preserves selected dropdown values", () => {
    const store = useLoansStore.getState();
    store.setLoanType("business-loan");
    store.setBusinessLoanField("purpose", "Renovation");
    store.setWorkingCapitalField("purpose", "Cash-Flow Gap");

    // Switch to working-capital
    store.setLoanType("working-capital");
    assert.equal(useLoansStore.getState().businessFormData.loanType, "working-capital");
    assert.equal(useLoansStore.getState().businessFormData.workingCapital.purpose, "Cash-Flow Gap");
    assert.equal(useLoansStore.getState().businessFormData.businessLoan.purpose, "Renovation");

    // Switch back to business-loan
    store.setLoanType("business-loan");
    assert.equal(useLoansStore.getState().businessFormData.loanType, "business-loan");
    assert.equal(useLoansStore.getState().businessFormData.businessLoan.purpose, "Renovation");
    assert.equal(useLoansStore.getState().businessFormData.workingCapital.purpose, "Cash-Flow Gap");
  });

  test("7. Review -> Edit preserves selected dropdown values and returns directly to Review", () => {
    const store = useLoansStore.getState();
    store.selectCategory({
      id: "business-loan",
      title: "Business Loan",
      description: "Business Credit",
      image: { uri: "test" } as any,
    });
    store.setBusinessProfileField("constitution", "LLP");
    store.setBusinessProfileField("businessActivity", "Retail");
    store.setBusinessLoanField("purpose", "Inventory Purchase");

    // Enter edit mode from review
    store.editFromReview("business-details");
    assert.equal(useLoansStore.getState().activeStep, "business-details");
    assert.equal(useLoansStore.getState().returnToReview, true);

    // Change a dropdown value
    store.setBusinessProfileField("constitution", "Private Limited Company");
    // Advance returns straight to review
    store.advanceTo("documents");
    assert.equal(useLoansStore.getState().activeStep, "review");
    assert.equal(useLoansStore.getState().returnToReview, false);
    assert.equal(
      useLoansStore.getState().businessFormData.businessProfile.constitution,
      "Private Limited Company"
    );
  });

  test("8. 'Other' selections show and require conditional text inputs", () => {
    // Business Loan Constitution "Other"
    const form = {
      loanType: "business-loan" as const,
      businessProfile: {
        businessName: "Acme Corp",
        constitution: "Other" as const,
        constitutionOther: "",
        businessActivity: "Trading" as const,
        activityOther: "",
        establishmentDate: "10-05-2020",
        businessAddress: "123 Main St",
        pincode: "500001",
        isGstRegistered: false,
        gstin: "",
        udyamRegistration: "",
      },
      businessLoan: {
        loanAmount: "500000",
        purpose: "Other" as const,
        purposeOther: "",
        purposeDescription: "Special purchase",
        projectCost: "",
      },
      workingCapital: {
        loanAmount: "500000",
        purpose: "Other" as const,
        purposeOther: "",
        purposeDescription: "Special purchase",
        monthlySales: "500000",
        monthlyExpenses: "300000",
      },
    };

    const res = validateBusinessLoanForm(form);
    assert.equal(res.isValid, false);
    assert.ok(res.errors.constitutionOther);
    assert.ok(res.errors.businessLoanPurposeOther);

    // When filled, errors resolve
    form.businessProfile.constitutionOther = "Trust";
    form.businessLoan.purposeOther = "Branch Acquisition";
    const res2 = validateBusinessLoanForm(form);
    assert.equal(res2.errors.constitutionOther, undefined);
    assert.equal(res2.errors.businessLoanPurposeOther, undefined);
  });

  test("9. Validation still enforces dropdown selection requirement", () => {
    // Missing jobType in Salaried
    const invalidSalaried = validatePersonalLoanForm({
      loanAmount: "250000",
      employmentType: "salaried",
      employerName: "TCS",
      companyName: "TCS",
      jobType: "",
      monthlyNetSalary: "50000",
      monthlySalary: "50000",
      workExperience: "1 - 3 years",
      salaryCreditMethod: "Bank Account",
      businessOrProfessionName: "",
      professionName: "",
      natureOfBusiness: "",
      averageMonthlyIncome: "",
      monthlyIncome: "",
      yearsInBusiness: "",
    });
    assert.equal(invalidSalaried.isValid, false);
    assert.equal(invalidSalaried.errors.jobType, "Please select your job type");

    // Missing natureOfBusiness in Self-Employed
    const invalidSelf = validatePersonalLoanForm({
      loanAmount: "250000",
      employmentType: "self-employed",
      employerName: "",
      companyName: "",
      jobType: "",
      monthlyNetSalary: "",
      monthlySalary: "",
      workExperience: "",
      salaryCreditMethod: "",
      businessOrProfessionName: "Apex Store",
      professionName: "Apex Store",
      natureOfBusiness: "",
      averageMonthlyIncome: "60000",
      monthlyIncome: "60000",
      yearsInBusiness: "3 - 5 years",
    });
    assert.equal(invalidSelf.isValid, false);
    assert.equal(invalidSelf.errors.natureOfBusiness, "Please select nature of business");
  });
});
