import React, { useCallback, useEffect, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CompleteProfileModal } from "@/shared/components/CompleteProfileModal";
import { UniversalDraftModal } from "@/shared/components/UniversalDraftModal";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import { isProfileComplete } from "@/shared/guards/serviceAccess";
import { LoanCategoryCard } from "../../components/LoanCategoryCard";
import { LoansHeader } from "../../components/LoansHeader";
import { LOAN_CATEGORIES } from "../../constants/loanCategories";
import type { LoanCategory } from "../../types/loanCategory.types";
import { useLoansStore, type LoanStep } from "../../store/loansStore";
import { LoanKycScreen } from "../LoanKycScreen";
import { BusinessLoanScreen } from "../../businessWorkingCapital";
import { PersonalLoanScreen } from "../../personalLoan";
import { HomeLoanRequirementScreen } from "../../homeLoan";
import { PropertyLoanScreen } from "../../property";
import { VehicleLoanScreen } from "../../vehicle";
import { MachineryLoanScreen } from "../../machinery";
import { MsmeLoanScreen } from "../../msme";
import { LoanNextStepPlaceholder } from "../../components/LoanNextStepPlaceholder";
import {
  getLoanDetailsStep,
  getLoanFlowDefinition,
  getLoanFlowTotalSteps,
  resolveLoanActiveStep,
} from "../../constants/loanFlow";
import { LoanDocumentUploadScreen } from "../LoanDocumentUploadScreen";
import { LoanReviewScreen } from "../LoanReviewScreen";
import { LoanUnderReviewScreen } from "../LoanUnderReviewScreen";
import { styles } from "./LoansMainScreen.styles";

/** Steps in which the customer may have unsaved work. */
const IN_PROGRESS_STEPS: readonly LoanStep[] = [
  "kyc",
  "business-details",
  "personal-employment",
  "home-loan-requirement",
  "property-details",
  "vehicle-details",
  "machinery-details",
  "msme-details",
  "documents",
  "review",
];

export const LoansMainScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { category: categoryParam, loan: loanParam } = useLocalSearchParams<{
    category?: string;
    loan?: string;
  }>();

  const selectedCategory = useLoansStore((state) => state.selectedCategory);
  const activeStep = useLoansStore((state) => state.activeStep);
  const selectCategory = useLoansStore((state) => state.selectCategory);
  const selectLoanProduct = useLoansStore((state) => state.selectLoanProduct);
  const pendingCategory = useLoansStore((state) => state.pendingCategory);
  const returnToReview = useLoansStore((state) => state.returnToReview);
  const completedSteps = useLoansStore((state) => state.completedSteps);
  const setActiveStep = useLoansStore((state) => state.setActiveStep);
  const editFromReview = useLoansStore((state) => state.editFromReview);
  const advanceTo = useLoansStore((state) => state.advanceTo);
  const retreatTo = useLoansStore((state) => state.retreatTo);
  const resetAll = useLoansStore((state) => state.resetAll);

  const profileCompleted = useAuthStore((s) => s.profileCompleted);
  const isExistingUser = useAuthStore((s) => s.isExistingUser);
  const customerExists = useAuthStore((s) => s.customerExists);
  const customer = useAuthStore((s) => s.customer);
  const authenticatedUser = useAuthStore((s) => s.authenticatedUser);

  const isProfileCompleteAuth = useMemo(() => {
    return isProfileComplete({
      profileCompleted,
      isExistingUser,
      customerExists,
      customer,
      authenticatedUser,
    });
  }, [
    profileCompleted,
    isExistingUser,
    customerExists,
    customer,
    authenticatedUser,
  ]);

  // When returning from profile completion or when category param is passed
  useEffect(() => {
    const target = categoryParam || loanParam;
    if (target && activeStep === "categories") {
      selectLoanProduct(target);
    } else if (pendingCategory && isProfileCompleteAuth && activeStep === "categories") {
      selectCategory(pendingCategory);
      useLoansStore.setState({ pendingCategory: null });
    }
  }, [
    categoryParam,
    loanParam,
    pendingCategory,
    isProfileCompleteAuth,
    activeStep,
    selectLoanProduct,
    selectCategory,
  ]);

  // Shared Finsolz "Save as Draft & Exit / Discard & Exit / Keep Editing" prompt.
  // The application lives in the loans store, so saving keeps it there for this session.
  const draftGuard = useUniversalDraftGuard({
    isDirty: () => IN_PROGRESS_STEPS.includes(useLoansStore.getState().activeStep),
    onSaveDraft: () => undefined,
    onDiscardDraft: resetAll,
    isSubmitted: () => useLoansStore.getState().activeStep === "submitted",
  });

  // A finished application must not reappear the next time Loans is opened.
  useEffect(
    () => () => {
      if (useLoansStore.getState().activeStep === "submitted") {
        useLoansStore.getState().resetAll();
      }
    },
    []
  );

  const handleCategoryPress = useCallback(
    (category: LoanCategory) => {
      selectLoanProduct(category.id);
    },
    [selectLoanProduct]
  );

  const handleDone = useCallback(() => {
    draftGuard.markSubmitted();
    resetAll();
    router.replace("/(main)/home");
  }, [draftGuard, resetAll, router]);

  const renderStep = (): React.ReactElement => {
    if (selectedCategory && activeStep !== "categories") {
      const flow = getLoanFlowDefinition(selectedCategory.id);
      const screenStep = resolveLoanActiveStep(selectedCategory.id, activeStep);
      const screenIsRevisit = completedSteps.includes(screenStep);
      const screenIsEditMode = returnToReview && screenStep === activeStep;
      if (flow.availability === "coming-soon") {
        return (
          <LoanNextStepPlaceholder
            title={selectedCategory.title}
            stepTitle="Applications are coming soon"
            subtitle="Loan product unavailable"
            currentStep={1}
            totalSteps={getLoanFlowTotalSteps(selectedCategory.id)}
            onBack={() => retreatTo("categories")}
            message="Applications for this loan are not available yet. This selection will not open another loan product."
          />
        );
      }

      switch (screenStep) {
        case "kyc":
          return (
            <LoanKycScreen
              onBackToCategories={() => retreatTo("categories")}
              onContinue={() =>
                advanceTo(getLoanDetailsStep(selectedCategory.id) ?? "unavailable")
              }
              isEditMode={screenIsEditMode}
              isRevisit={screenIsRevisit}
            />
          );
        case "property-details":
          return (
            <PropertyLoanScreen
              onBackToKyc={() => retreatTo("kyc")}
              onContinue={() => advanceTo("documents")}
              isEditMode={screenIsEditMode}
              isRevisit={screenIsRevisit}
            />
          );
        case "vehicle-details":
          return (
            <VehicleLoanScreen
              onBackToKyc={() => retreatTo("kyc")}
              onContinue={() => advanceTo("documents")}
              isEditMode={screenIsEditMode}
              isRevisit={screenIsRevisit}
            />
          );
        case "machinery-details":
          return (
            <MachineryLoanScreen
              onBackToKyc={() => retreatTo("kyc")}
              onContinue={() => advanceTo("documents")}
              isEditMode={screenIsEditMode}
              isRevisit={screenIsRevisit}
            />
          );
        case "msme-details":
          return (
            <MsmeLoanScreen
              onBackToKyc={() => retreatTo("kyc")}
              onContinue={() => advanceTo("documents")}
              isEditMode={screenIsEditMode}
              isRevisit={screenIsRevisit}
            />
          );
        case "home-loan-requirement":
          return (
            <HomeLoanRequirementScreen
              onBackToKyc={() => retreatTo("kyc")}
              onContinue={() => advanceTo("documents")}
              isEditMode={screenIsEditMode}
              isRevisit={screenIsRevisit}
            />
          );
        case "home-employment-income":
          return (
            <LoanNextStepPlaceholder
              title="Tell us about your income"
              stepTitle="Employment & Income"
              subtitle="Home Loan Step 3"
              currentStep={3}
              totalSteps={getLoanFlowTotalSteps("home-loan")}
              onBack={() => retreatTo("home-loan-requirement")}
            />
          );
        case "personal-employment":
          return (
            <PersonalLoanScreen
              onBackToKyc={() => retreatTo("kyc")}
              onContinue={() => advanceTo("documents")}
              isEditMode={screenIsEditMode}
              isRevisit={screenIsRevisit}
            />
          );
        case "business-details":
          return (
            <BusinessLoanScreen
              onBackToKyc={() => retreatTo("kyc")}
              onContinue={() => advanceTo("documents")}
              isEditMode={screenIsEditMode}
              isRevisit={screenIsRevisit}
            />
          );
        case "documents":
          return (
            <LoanDocumentUploadScreen
              onBackToBusinessDetails={() => {
                retreatTo(getLoanDetailsStep(selectedCategory.id) ?? "unavailable");
              }}
              onContinue={() => advanceTo("review")}
              isEditMode={screenIsEditMode}
              isRevisit={screenIsRevisit}
            />
          );
        case "review":
          return (
            <LoanReviewScreen
              onBack={() => setActiveStep("documents")}
              onEditKyc={() => editFromReview("kyc")}
              onEditBusiness={() => {
                const detailsStep = getLoanDetailsStep(selectedCategory.id);
                if (detailsStep) editFromReview(detailsStep);
              }}
              onEditDocuments={() => editFromReview("documents")}
              onSubmitSuccess={() => setActiveStep("submitted")}
            />
          );
        case "submitted":
          return (
            <LoanUnderReviewScreen
              onContactSupport={() => router.push("/chat/support")}
              onDone={handleDone}
            />
          );
        case "unavailable":
        default:
          return (
            <LoanNextStepPlaceholder
              title={selectedCategory.title}
              stepTitle="Applications are coming soon"
              subtitle="Loan product unavailable"
              currentStep={1}
              totalSteps={getLoanFlowTotalSteps(selectedCategory.id)}
              onBack={() => retreatTo("categories")}
              message="Applications for this loan are not available yet. This selection will not open another loan product."
            />
          );
      }
    }

    return (
      <View style={styles.container}>
        <LoansHeader onBack={() => router.back()} />
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.cardList}>
            {LOAN_CATEGORIES.map((category) => (
              <LoanCategoryCard
                key={category.id}
                category={category}
                onPress={handleCategoryPress}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <>
      {renderStep()}
      <UniversalDraftModal
        visible={draftGuard.showDraftModal}
        title="Save Loan Application?"
        message="Save your progress so you can continue your loan application without re-entering details."
        onSaveAndExit={draftGuard.handleSaveAndExit}
        onDiscardAndExit={draftGuard.handleDiscardAndExit}
        onCancel={draftGuard.handleCancel}
      />
    </>
  );
};

export default LoansMainScreen;
