/// <reference types="node" />
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, test } from "node:test";
import { useLoansStore } from "../../modules/loans/store/loansStore";
import { useAuthStore } from "../../modules/authentication/store/authStore";
import type { Customer } from "../../types/domain";

const ALL_LOAN_PRODUCTS: { id: string; title: string; screen2Step: string }[] = [
  { id: "personal-loan", title: "Personal Loan", screen2Step: "personal-employment" },
  { id: "business-loan", title: "Business Loan", screen2Step: "business-details" },
  { id: "working-capital", title: "Working Capital", screen2Step: "business-details" },
  { id: "home-loan", title: "Home Loan", screen2Step: "home-loan-requirement" },
  { id: "property-loan", title: "Property Loan", screen2Step: "property-details" },
  { id: "vehicle-loan", title: "Vehicle Loan", screen2Step: "vehicle-details" },
  { id: "machinery-loan", title: "Machinery Loan", screen2Step: "machinery-details" },
];

const mockCompleteCustomer: Customer = {
  customerId: "cust-1",
  customerType: "Individual",
  name: "Arjun Verma",
  mobile: "9876543210",
  email: "arjun.verma@example.com",
  pan: "ABCDE1234F",
  aadhaar: "123456789012",
  dob: "1990-05-15",
  address: "Flat 402, Lotus Towers, MG Road, Pune, Maharashtra - 411001",
  profileCompleted: true,
};

describe("Loans Module Profile Lock & Gate Regression (28 Requirements)", () => {
  beforeEach(() => {
    useLoansStore.getState().resetAll();
    useAuthStore.setState({
      isLoggedIn: true,
      profileCompleted: false,
      isExistingUser: false,
      customerExists: false,
      customer: null,
      authenticatedUser: null,
      isCompleteProfileModalOpen: false,
      pendingServiceRoute: null,
    });
  });

  // Tests 1-7: New user tapping each of the 7 loans sees Complete Profile
  for (let i = 0; i < ALL_LOAN_PRODUCTS.length; i++) {
    const loan = ALL_LOAN_PRODUCTS[i];
    test(`Req ${i + 1}: New user tapping ${loan.title} sees Complete Profile popup`, () => {
      // Incomplete/new user state
      useAuthStore.setState({
        isLoggedIn: true,
        profileCompleted: false,
        customer: null,
        isCompleteProfileModalOpen: false,
      });

      const allowed = useLoansStore.getState().selectLoanProduct(loan.id);

      assert.equal(allowed, false, "Should block entrance for incomplete profile");
      assert.equal(
        useAuthStore.getState().isCompleteProfileModalOpen,
        true,
        "Complete Profile modal must be opened"
      );
      assert.equal(
        useAuthStore.getState().pendingServiceRoute,
        `/service/loans?category=${loan.id}`,
        "Pending route must point to selected loan"
      );
      assert.equal(
        useLoansStore.getState().pendingCategory?.id,
        loan.id === "working-capital" ? "business-loan" : loan.id,
        "Pending category must be saved in loans store"
      );
    });
  }

  test("Req 8: Completed profile skips Complete Profile popup", () => {
    useAuthStore.setState({
      isLoggedIn: true,
      profileCompleted: true,
      isExistingUser: true,
      customer: mockCompleteCustomer,
      isCompleteProfileModalOpen: false,
    });

    const allowed = useLoansStore.getState().selectLoanProduct("personal-loan");
    assert.equal(allowed, true);
    assert.equal(useAuthStore.getState().isCompleteProfileModalOpen, false);
    assert.equal(useLoansStore.getState().activeStep, "kyc");
    assert.equal(useLoansStore.getState().isProfileLocked, true);
  });

  test("Req 9: Incomplete profile shows Complete Profile", () => {
    // Missing required fields
    useAuthStore.setState({
      isLoggedIn: true,
      profileCompleted: false,
      customer: {
        customerId: "c1",
        customerType: "Individual",
        name: "",
        mobile: "9876543210",
        email: "",
        dob: "",
        pan: "",
        aadhaar: "",
        address: "",
        profileCompleted: false,
      },
      isCompleteProfileModalOpen: false,
    });

    const allowed = useLoansStore.getState().selectLoanProduct("business-loan");
    assert.equal(allowed, false);
    assert.equal(useAuthStore.getState().isCompleteProfileModalOpen, true);
  });

  test("Req 10: Completing profile continues into the originally selected loan", () => {
    // 1. Incomplete user taps Vehicle Loan
    useAuthStore.setState({
      isLoggedIn: true,
      profileCompleted: false,
      customer: null,
      isCompleteProfileModalOpen: false,
    });
    useLoansStore.getState().selectLoanProduct("vehicle-loan");
    assert.equal(useLoansStore.getState().pendingCategory?.id, "vehicle-loan");

    // 2. User completes profile
    useAuthStore.setState({
      profileCompleted: true,
      isExistingUser: true,
      customer: mockCompleteCustomer,
      isCompleteProfileModalOpen: false,
    });

    // 3. LoansMainScreen effect / navigation resumes
    const pending = useLoansStore.getState().pendingCategory;
    assert.ok(pending);
    useLoansStore.getState().selectCategory(pending);
    useLoansStore.setState({ pendingCategory: null });

    assert.equal(useLoansStore.getState().selectedCategory?.id, "vehicle-loan");
    assert.equal(useLoansStore.getState().activeStep, "kyc");
    assert.equal(useLoansStore.getState().isProfileLocked, true);
  });

  // Tests 11-17: KYC profile fields are locked for all 7 loans
  for (let i = 0; i < ALL_LOAN_PRODUCTS.length; i++) {
    const loan = ALL_LOAN_PRODUCTS[i];
    test(`Req ${11 + i}: KYC profile fields are locked for ${loan.title}`, () => {
      useAuthStore.setState({
        isLoggedIn: true,
        profileCompleted: true,
        isExistingUser: true,
        customer: mockCompleteCustomer,
      });

      const allowed = useLoansStore.getState().selectLoanProduct(loan.id);
      assert.equal(allowed, true);
      assert.equal(useLoansStore.getState().isProfileLocked, true);
      assert.equal(useLoansStore.getState().kycData.fullName, mockCompleteCustomer.name);
      assert.equal(useLoansStore.getState().kycData.mobile, mockCompleteCustomer.mobile);
    });
  }

  test("Req 18: Locked fields cannot be modified by typing (store action bypass prevention)", () => {
    useAuthStore.setState({
      isLoggedIn: true,
      profileCompleted: true,
      isExistingUser: true,
      customer: mockCompleteCustomer,
    });
    useLoansStore.getState().selectLoanProduct("personal-loan");
    assert.equal(useLoansStore.getState().isProfileLocked, true);

    const originalName = useLoansStore.getState().kycData.fullName;
    const originalPan = useLoansStore.getState().kycData.pan;
    const originalMobile = useLoansStore.getState().kycData.mobile;
    const originalDob = useLoansStore.getState().kycData.dob;

    // Direct malicious store actions attempt
    useLoansStore.getState().setKycField("fullName", "Hacker Name");
    useLoansStore.getState().setKycField("pan", "ZZZZZ9999Z");
    useLoansStore.getState().setKycField("mobile", "0000000000");
    useLoansStore.getState().setKycField("dob", "2000-01-01");

    assert.equal(useLoansStore.getState().kycData.fullName, originalName);
    assert.equal(useLoansStore.getState().kycData.pan, originalPan);
    assert.equal(useLoansStore.getState().kycData.mobile, originalMobile);
    assert.equal(useLoansStore.getState().kycData.dob, originalDob);
  });

  test("Req 19: Locked fields cannot be modified by paste (address bypass prevention)", () => {
    useAuthStore.setState({
      isLoggedIn: true,
      profileCompleted: true,
      isExistingUser: true,
      customer: mockCompleteCustomer,
    });
    useLoansStore.getState().selectLoanProduct("business-loan");
    assert.equal(useLoansStore.getState().isProfileLocked, true);

    const originalCity = useLoansStore.getState().kycData.currentAddress.city;
    const originalPincode = useLoansStore.getState().kycData.currentAddress.pincode;

    useLoansStore.getState().setCurrentAddressField("city", "FakeCity");
    useLoansStore.getState().setCurrentAddressField("pincode", "999999");
    useLoansStore.getState().setPermanentAddressField("city", "FakeCity");
    useLoansStore.getState().setPermanentSameAsCurrent(false);

    assert.equal(useLoansStore.getState().kycData.currentAddress.city, originalCity);
    assert.equal(useLoansStore.getState().kycData.currentAddress.pincode, originalPincode);
  });

  test("Req 20: Locked dropdowns cannot be modified (state dropdown bypass prevention)", () => {
    useAuthStore.setState({
      isLoggedIn: true,
      profileCompleted: true,
      isExistingUser: true,
      customer: mockCompleteCustomer,
    });
    useLoansStore.getState().selectLoanProduct("home-loan");
    assert.equal(useLoansStore.getState().isProfileLocked, true);

    const originalState = useLoansStore.getState().kycData.currentAddress.state;
    useLoansStore.getState().setCurrentAddressField("state", "Goa");
    assert.equal(useLoansStore.getState().kycData.currentAddress.state, originalState);

    // Verify UI file binds disabled={isLocked}
    const addressSource = fs.readFileSync(
      path.join(process.cwd(), "src/modules/loans/components/AddressSection/AddressSection.tsx"),
      "utf8"
    );
    assert.ok(addressSource.includes("disabled={isLocked}"));
  });

  test("Req 21: Review → Edit does not unlock profile fields", () => {
    useAuthStore.setState({
      isLoggedIn: true,
      profileCompleted: true,
      isExistingUser: true,
      customer: mockCompleteCustomer,
    });
    useLoansStore.getState().selectLoanProduct("personal-loan");
    useLoansStore.getState().advanceTo("personal-employment");
    useLoansStore.getState().advanceTo("documents");
    useLoansStore.getState().advanceTo("review");

    // Enter edit mode on kyc
    useLoansStore.getState().editFromReview("kyc");
    assert.equal(useLoansStore.getState().activeStep, "kyc");
    assert.equal(useLoansStore.getState().returnToReview, true);
    assert.equal(useLoansStore.getState().isProfileLocked, true);

    // Attempt modification
    const originalName = useLoansStore.getState().kycData.fullName;
    useLoansStore.getState().setKycField("fullName", "Modified In Review Edit");
    assert.equal(useLoansStore.getState().kycData.fullName, originalName);
  });

  test("Req 22: Loan-specific fields remain editable", () => {
    useAuthStore.setState({
      isLoggedIn: true,
      profileCompleted: true,
      isExistingUser: true,
      customer: mockCompleteCustomer,
    });
    useLoansStore.getState().selectLoanProduct("business-loan");
    useLoansStore.getState().advanceTo("business-details");

    // Business details loan-specific fields
    useLoansStore.getState().setBusinessLoanField("loanAmount", "5000000");
    useLoansStore.getState().setBusinessProfileField("businessName", "Acme Tech Enterprises");
    useLoansStore.getState().setBusinessProfileField("constitution", "Private Limited Company");

    assert.equal(useLoansStore.getState().businessFormData.businessLoan.loanAmount, "5000000");
    assert.equal(useLoansStore.getState().businessFormData.businessProfile.businessName, "Acme Tech Enterprises");
    assert.equal(useLoansStore.getState().businessFormData.businessProfile.constitution, "Private Limited Company");
  });

  test("Req 23: Update & Continue continues to work", () => {
    useAuthStore.setState({
      isLoggedIn: true,
      profileCompleted: true,
      isExistingUser: true,
      customer: mockCompleteCustomer,
    });
    useLoansStore.getState().selectLoanProduct("personal-loan");
    useLoansStore.getState().advanceTo("personal-employment");
    useLoansStore.getState().advanceTo("documents");
    useLoansStore.getState().advanceTo("review");

    // Edit Screen 2
    useLoansStore.getState().editFromReview("personal-employment");
    assert.equal(useLoansStore.getState().returnToReview, true);

    // Click Update & Continue
    useLoansStore.getState().advanceTo("documents");
    assert.equal(useLoansStore.getState().activeStep, "review");
    assert.equal(useLoansStore.getState().returnToReview, false);
  });

  test("Req 24: Back navigation preserves locked profile state", () => {
    useAuthStore.setState({
      isLoggedIn: true,
      profileCompleted: true,
      isExistingUser: true,
      customer: mockCompleteCustomer,
    });
    useLoansStore.getState().selectLoanProduct("property-loan");
    useLoansStore.getState().advanceTo("property-details");
    useLoansStore.getState().retreatTo("kyc");

    assert.equal(useLoansStore.getState().activeStep, "kyc");
    assert.equal(useLoansStore.getState().isProfileLocked, true);
    assert.ok(useLoansStore.getState().completedSteps.includes("kyc"));
  });

  test("Req 25: Profile state does not leak between loan products", () => {
    useAuthStore.setState({
      isLoggedIn: true,
      profileCompleted: true,
      isExistingUser: true,
      customer: mockCompleteCustomer,
    });

    // Start Business Loan
    useLoansStore.getState().selectLoanProduct("business-loan");
    useLoansStore.getState().setBusinessProfileField("businessName", "Delta Corp");
    assert.equal(useLoansStore.getState().businessFormData.businessProfile.businessName, "Delta Corp");

    // Switch to Vehicle Loan
    useLoansStore.getState().selectLoanProduct("vehicle-loan");
    assert.equal(useLoansStore.getState().selectedCategory?.id, "vehicle-loan");
    // Shared profile preserved
    assert.equal(useLoansStore.getState().kycData.fullName, mockCompleteCustomer.name);
    assert.equal(useLoansStore.getState().isProfileLocked, true);
    // Loan-specific fields reset/isolated
    assert.equal(useLoansStore.getState().vehicleFormData.vehicleCategory, "");
  });

  test("Req 26: Complete Profile is NOT duplicated inside Loans", () => {
    const mainScreenSource = fs.readFileSync(
      path.join(process.cwd(), "src/modules/loans/screens/LoansMainScreen/LoansMainScreen.tsx"),
      "utf8"
    );
    // Verified: uses shared CompleteProfileModal
    assert.ok(mainScreenSource.includes('@/shared/components/CompleteProfileModal'));
    assert.ok(!fs.existsSync(path.join(process.cwd(), "src/modules/loans/components/CompleteProfileModal")));
  });

  test("Req 27: Existing ITR/GST Complete Profile behavior remains unchanged", () => {
    const gstScreenSource = fs.readFileSync(
      path.join(process.cwd(), "src/modules/gst/screens/GstScreen/GstScreen.tsx"),
      "utf8"
    );
    const itrScreenSource = fs.readFileSync(
      path.join(process.cwd(), "src/modules/itr/screens/ItrScreen/ItrScreen.tsx"),
      "utf8"
    );

    assert.ok(gstScreenSource.includes("useServiceAccessGuard"));
    assert.ok(itrScreenSource.includes("useServiceAccessGuard"));
  });

  test("Req 28: Existing loan navigation remains unchanged after profile completion", () => {
    useAuthStore.setState({
      isLoggedIn: true,
      profileCompleted: true,
      isExistingUser: true,
      customer: mockCompleteCustomer,
    });

    useLoansStore.getState().selectLoanProduct("machinery-loan");
    assert.equal(useLoansStore.getState().activeStep, "kyc");

    useLoansStore.getState().advanceTo("machinery-details");
    assert.equal(useLoansStore.getState().activeStep, "machinery-details");

    useLoansStore.getState().advanceTo("documents");
    assert.equal(useLoansStore.getState().activeStep, "documents");

    useLoansStore.getState().advanceTo("review");
    assert.equal(useLoansStore.getState().activeStep, "review");

    useLoansStore.getState().advanceTo("submitted");
    assert.equal(useLoansStore.getState().activeStep, "submitted");
  });
});
