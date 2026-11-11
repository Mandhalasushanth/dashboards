/// <reference types="node" />
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test, describe, beforeEach } from "node:test";
import { useLoansStore, type LoanStep } from "../../modules/loans/store/loansStore";
import {
  UPDATE_AND_CONTINUE_LABEL,
  getContinueLabel,
} from "../../modules/loans/constants/continueLabels";
import type { LoanCategoryId } from "../../modules/loans/types/loanCategory.types";

const category = (id: LoanCategoryId) => ({ id, title: id, description: "", image: { uri: "t" } });

/** The Screen 1 → Screen 2 → Documents sequence of each loan. */
const FLOWS: Record<string, LoanStep[]> = {
  "personal-loan": ["kyc", "personal-employment", "documents"],
  "business-loan": ["kyc", "business-details", "documents"],
  "home-loan": ["kyc", "home-loan-requirement", "documents"],
  "property-loan": ["kyc", "property-details", "documents"],
  "vehicle-loan": ["kyc", "vehicle-details", "documents"],
  "machinery-loan": ["kyc", "machinery-details", "documents"],
  "msme-loan": ["kyc", "msme-details", "documents"],
};

const isRevisit = () => {
  const s = useLoansStore.getState();
  return s.completedSteps.includes(s.activeStep);
};
const labelNow = () =>
  getContinueLabel(isRevisit() || useLoansStore.getState().returnToReview, "Continue →");

const root = path.join(process.cwd(), "src/modules/loans");
const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
  );

describe("Update & Continue after going Back", () => {
  beforeEach(() => useLoansStore.getState().resetAll());

  test("the first visit of every screen shows Continue", () => {
    Object.entries(FLOWS).forEach(([id, steps]) => {
      useLoansStore.getState().resetAll();
      useLoansStore.getState().selectCategory(category(id as LoanCategoryId));
      steps.forEach((step, index) => {
        assert.equal(useLoansStore.getState().activeStep, step, `${id} ${step}`);
        assert.equal(labelNow(), "Continue →", `${id} ${step}`);
        if (index < steps.length - 1) useLoansStore.getState().advanceTo(steps[index + 1]);
      });
    });
  });

  test("going Back to a completed screen switches the CTA to Update & Continue", () => {
    Object.entries(FLOWS).forEach(([id, steps]) => {
      useLoansStore.getState().resetAll();
      useLoansStore.getState().selectCategory(category(id as LoanCategoryId));
      useLoansStore.getState().advanceTo(steps[1]);
      assert.equal(labelNow(), "Continue →", `${id} screen 2 first visit`);
      useLoansStore.getState().retreatTo("kyc");
      assert.equal(useLoansStore.getState().activeStep, "kyc");
      assert.equal(labelNow(), UPDATE_AND_CONTINUE_LABEL, id);
      // Screen 2 was left without continuing, so it is still a first visit.
      assert.equal(useLoansStore.getState().completedSteps.includes(steps[1]), false, id);
    });
  });

  test("updating moves forward normally, never to Review", () => {
    Object.entries(FLOWS).forEach(([id, steps]) => {
      useLoansStore.getState().resetAll();
      useLoansStore.getState().selectCategory(category(id as LoanCategoryId));
      useLoansStore.getState().advanceTo(steps[1]);
      useLoansStore.getState().retreatTo("kyc");
      useLoansStore.getState().advanceTo(steps[1]);
      const s = useLoansStore.getState();
      assert.equal(s.activeStep, steps[1], id);
      assert.equal(s.returnToReview, false, id);
      assert.equal(labelNow(), "Continue →", `${id}: screen 2 is still a first visit`);
      useLoansStore.getState().advanceTo("documents");
      assert.equal(useLoansStore.getState().activeStep, "documents", id);
    });
  });

  test("later screens keep their data when an earlier screen is edited", () => {
    const s = useLoansStore.getState();
    s.selectCategory(category("property-loan"));
    s.advanceTo("property-details");
    useLoansStore.getState().setPropertyField("city", "Pune");
    useLoansStore.getState().setPropertyField("requestedAmount", "2500000");
    useLoansStore.getState().advanceTo("documents");
    useLoansStore.getState().setDocumentAttachment("property_document", {
      id: "p1",
      documentId: "property_document",
      fileName: "deed.pdf",
      fileUri: "file:///deed.pdf",
      fileSize: 10,
      mimeType: "application/pdf",
      status: "selected",
    });
    useLoansStore.getState().retreatTo("property-details");
    useLoansStore.getState().retreatTo("kyc");
    useLoansStore.getState().setKycField("fullName", "Edited Name");
    useLoansStore.getState().advanceTo("property-details");

    const after = useLoansStore.getState();
    assert.equal(after.kycData.fullName, "Edited Name");
    assert.equal(after.propertyFormData.city, "Pune");
    assert.equal(after.propertyFormData.requestedAmount, "2500000");
    assert.ok(after.uploadedDocuments.property_document);
  });

  test("the same applies to personal, business and home data", () => {
    const s = useLoansStore.getState();
    s.selectCategory(category("personal-loan"));
    s.advanceTo("personal-employment");
    useLoansStore.getState().setPersonalLoanField("employerName", "Infosys");
    useLoansStore.getState().retreatTo("kyc");
    useLoansStore.getState().advanceTo("personal-employment");
    assert.equal(useLoansStore.getState().personalFormData.employerName, "Infosys");

    useLoansStore.getState().resetAll();
    useLoansStore.getState().selectCategory(category("home-loan"));
    useLoansStore.getState().advanceTo("home-loan-requirement");
    useLoansStore.getState().setHomeLoanField("loanAmount", "2500000");
    useLoansStore.getState().retreatTo("kyc");
    useLoansStore.getState().advanceTo("home-loan-requirement");
    assert.equal(useLoansStore.getState().homeLoanFormData.loanAmount, "2500000");

    useLoansStore.getState().resetAll();
    useLoansStore.getState().selectCategory(category("business-loan"));
    useLoansStore.getState().advanceTo("business-details");
    useLoansStore.getState().setBusinessProfileField("businessName", "Apex Traders");
    useLoansStore.getState().retreatTo("kyc");
    useLoansStore.getState().advanceTo("business-details");
    assert.equal(
      useLoansStore.getState().businessFormData.businessProfile.businessName,
      "Apex Traders"
    );
  });

  test("a different loan starts again with Continue; the same loan keeps its progress", () => {
    const s = useLoansStore.getState();
    s.selectCategory(category("personal-loan"));
    s.advanceTo("personal-employment");
    useLoansStore.getState().selectCategory(category("personal-loan"));
    assert.ok(useLoansStore.getState().completedSteps.includes("kyc"));
    useLoansStore.getState().selectCategory(category("property-loan"));
    assert.deepEqual(useLoansStore.getState().completedSteps, []);
    assert.equal(labelNow(), "Continue →");
  });

  test("a new application after a reset starts with Continue", () => {
    const s = useLoansStore.getState();
    s.selectCategory(category("home-loan"));
    s.advanceTo("home-loan-requirement");
    useLoansStore.getState().resetAll();
    assert.deepEqual(useLoansStore.getState().completedSteps, []);
  });

  test("Review → Edit still returns to Review and uses the same label", () => {
    const s = useLoansStore.getState();
    s.selectCategory(category("personal-loan"));
    s.advanceTo("personal-employment");
    useLoansStore.getState().advanceTo("documents");
    useLoansStore.getState().advanceTo("review");
    useLoansStore.getState().editFromReview("personal-employment");
    assert.equal(useLoansStore.getState().returnToReview, true);
    assert.equal(labelNow(), UPDATE_AND_CONTINUE_LABEL);
    useLoansStore.getState().advanceTo("documents");
    assert.equal(useLoansStore.getState().activeStep, "review");
    assert.equal(useLoansStore.getState().returnToReview, false);
  });
});

describe("one CTA label implementation", () => {
  const screens = [
    "screens/LoanKycScreen/LoanKycScreen.tsx",
    "businessWorkingCapital/screens/BusinessLoanScreen/BusinessLoanScreen.tsx",
    "personalLoan/screens/PersonalLoanScreen/PersonalLoanScreen.tsx",
    "homeLoan/screens/HomeLoanRequirementScreen/HomeLoanRequirementScreen.tsx",
    "property/screens/PropertyLoanScreen/PropertyLoanScreen.tsx",
    "screens/LoanDocumentUploadScreen/LoanDocumentUploadScreen.tsx",
  ];

  test("every screen takes its label from the shared helper and accepts isRevisit", () => {
    screens.forEach((file) => {
      const source = fs.readFileSync(path.join(root, file), "utf8");
      assert.ok(source.includes("getContinueLabel("), file);
      assert.ok(source.includes("isRevisit"), file);
      assert.ok(/continueLabels"/.test(source), file);
    });
  });

  test("the Update & Continue text is defined once, in the shared constants", () => {
    const definitions = walk(root)
      .filter((f) => /\.tsx?$/.test(f))
      .filter((f) => fs.readFileSync(f, "utf8").includes('"Update & Continue →"'));
    assert.deepEqual(
      definitions.map((f) => path.basename(f)),
      ["continueLabels.ts"]
    );
  });

  test("the main screen passes isRevisit to all flow screens and no new CTA component exists", () => {
    const main = fs.readFileSync(
      path.join(root, "screens/LoansMainScreen/LoansMainScreen.tsx"),
      "utf8"
    );
    assert.equal((main.match(/isRevisit=\{screenIsRevisit\}/g) ?? []).length, 9);
    const names = walk(root).map((f) => path.basename(f));
    assert.ok(
      !names.some((n) => /(Continue|Cta|PrimaryButton)/i.test(n) && n !== "continueLabels.ts")
    );
  });

  test("the main screen renders product details from the category-resolved step", () => {
    const main = fs.readFileSync(
      path.join(root, "screens/LoansMainScreen/LoansMainScreen.tsx"),
      "utf8"
    );
    assert.match(main, /resolveLoanActiveStep\(selectedCategory\.id, activeStep\)/);
    assert.match(main, /switch \(screenStep\)/);
    assert.match(main, /case "vehicle-details":[\s\S]{0,220}<VehicleLoanScreen/);
    assert.match(main, /case "machinery-details":[\s\S]{0,220}<MachineryLoanScreen/);
    assert.match(main, /case "home-loan-requirement":[\s\S]{0,220}<HomeLoanRequirementScreen/);
    assert.match(main, /case "property-details":[\s\S]{0,220}<PropertyLoanScreen/);
    assert.match(main, /case "business-details":[\s\S]{0,220}<BusinessLoanScreen/);
  });

  test("a revisited screen keeps its Back button; only Review → Edit hides it", () => {
    const header = fs.readFileSync(
      path.join(root, "components/LoanFlowHeader/LoanFlowHeader.tsx"),
      "utf8"
    );
    assert.ok(/isEditMode/.test(header));
    assert.ok(!/isRevisit/.test(header));
  });
});
