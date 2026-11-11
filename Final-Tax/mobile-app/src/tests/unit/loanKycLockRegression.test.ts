/// <reference types="node" />
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, test } from "node:test";
import { useLoansStore, type LoanStep } from "../../modules/loans/store/loansStore";
import type { LoanCategoryId } from "../../modules/loans/types/loanCategory.types";

const IMPLEMENTED_FLOWS: { categoryId: LoanCategoryId; detailsStep: LoanStep }[] = [
  { categoryId: "business-loan", detailsStep: "business-details" },
  { categoryId: "personal-loan", detailsStep: "personal-employment" },
  { categoryId: "home-loan", detailsStep: "home-loan-requirement" },
  { categoryId: "property-loan", detailsStep: "property-details" },
  { categoryId: "vehicle-loan", detailsStep: "vehicle-details" },
  { categoryId: "machinery-loan", detailsStep: "machinery-details" },
  { categoryId: "msme-loan", detailsStep: "msme-details" },
];

const category = (id: LoanCategoryId) => ({
  id,
  title: id,
  description: "",
  image: { uri: "test" },
});

const isKycLocked = () => {
  const state = useLoansStore.getState();
  const isRevisit = state.completedSteps.includes("kyc");
  const isEditMode = state.returnToReview && state.activeStep === "kyc";
  return state.isProfileLocked || (isRevisit && !isEditMode);
};

describe("shared KYC lock regression", () => {
  beforeEach(() => useLoansStore.getState().resetAll());

  test("completed profile locks KYC on entry for every implemented loan product", () => {
    for (const { categoryId } of IMPLEMENTED_FLOWS) {
      useLoansStore.getState().resetAll();
      useLoansStore.setState({ isProfileLocked: true });
      useLoansStore.getState().selectCategory(category(categoryId));

      assert.equal(useLoansStore.getState().activeStep, "kyc", categoryId);
      assert.equal(isKycLocked(), true, categoryId);
    }
  });

  test("ordinary Back revisit locks verified identity across all implemented products", () => {
    for (const { categoryId, detailsStep } of IMPLEMENTED_FLOWS) {
      useLoansStore.getState().resetAll();
      useLoansStore.getState().selectCategory(category(categoryId));
      useLoansStore.getState().advanceTo(detailsStep);
      useLoansStore.getState().retreatTo("kyc");

      assert.equal(useLoansStore.getState().activeStep, "kyc", categoryId);
      assert.ok(useLoansStore.getState().completedSteps.includes("kyc"), categoryId);
      assert.equal(isKycLocked(), true, categoryId);
    }
  });

  test("Review → Edit preserves profile lock and Update & Continue returns to Review", () => {
    useLoansStore.getState().selectCategory(category("personal-loan"));
    useLoansStore.setState({ isProfileLocked: true });
    useLoansStore.getState().advanceTo("personal-employment");
    useLoansStore.getState().advanceTo("documents");
    useLoansStore.getState().advanceTo("review");
    useLoansStore.getState().editFromReview("kyc");

    assert.equal(useLoansStore.getState().activeStep, "kyc");
    // Under the new profile lock contract, profile fields must NOT unlock on Review -> Edit
    assert.equal(isKycLocked(), true);

    useLoansStore.getState().advanceTo("personal-employment");
    assert.equal(useLoansStore.getState().activeStep, "review");
    assert.equal(useLoansStore.getState().returnToReview, false);
  });

  test("switching loan categories clears step completion while preserving shared profile", () => {
    useLoansStore.getState().selectCategory(category("vehicle-loan"));
    useLoansStore.getState().advanceTo("vehicle-details");
    assert.ok(useLoansStore.getState().completedSteps.includes("kyc"));

    useLoansStore.getState().selectCategory(category("property-loan"));

    assert.deepEqual(useLoansStore.getState().completedSteps, []);
    assert.equal(useLoansStore.getState().activeStep, "kyc");
  });

  test("reset clears KYC completion and removes state", () => {
    useLoansStore.getState().selectCategory(category("home-loan"));
    useLoansStore.getState().advanceTo("home-loan-requirement");
    useLoansStore.getState().retreatTo("kyc");
    assert.equal(isKycLocked(), true);

    useLoansStore.getState().resetAll();

    assert.deepEqual(useLoansStore.getState().completedSteps, []);
    assert.equal(useLoansStore.getState().activeStep, "categories");
    assert.equal(isKycLocked(), false);
  });

  test("the shared KYC screen binds isLocked to profile lock state", () => {
    const screenSource = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/modules/loans/screens/LoanKycScreen/LoanKycScreen.tsx"
      ),
      "utf8"
    );

    assert.ok(screenSource.includes("isLocked={isKycLocked}"));
    assert.ok(screenSource.includes("isProfileLockedStore"));
  });
});
