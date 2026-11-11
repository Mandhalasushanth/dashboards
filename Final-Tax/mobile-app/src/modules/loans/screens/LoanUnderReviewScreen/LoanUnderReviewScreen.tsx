import React, { useMemo } from "react";
import { formatCurrencyINR } from "@/shared/formatters/currencyFormatter";
import { ApplicationUnderReview } from "@/shared/components/ApplicationUnderReview";
import type { ApplicationSummaryRow } from "@/shared/components/ApplicationUnderReview";
import { useLoansStore } from "../../store/loansStore";
import { getSubmittedLoanSummary } from "../../utils/loanReviewSummary";

interface LoanUnderReviewScreenProps {
  onContactSupport: () => void;
  onDone: () => void;
}

const UNCONFIRMED_REFERENCE_NOTE =
  "Saved on this device. This reference will be confirmed once our team receives your application.";

/** Loans' use of the shared post-submission screen: it only maps loan data into it. */
export const LoanUnderReviewScreen: React.FC<LoanUnderReviewScreenProps> = ({
  onContactSupport,
  onDone,
}) => {
  const applicationId = useLoansStore((state) => state.submittedApplicationId);
  const submittedAt = useLoansStore((state) => state.submittedAt);
  const isSynced = useLoansStore((state) => state.isSubmissionSynced);
  const businessFormData = useLoansStore((state) => state.businessFormData);
  const personalFormData = useLoansStore((state) => state.personalFormData);
  const propertyFormData = useLoansStore((state) => state.propertyFormData);
  const homeLoanFormData = useLoansStore((state) => state.homeLoanFormData);
  const vehicleFormData = useLoansStore((state) => state.vehicleFormData);
  const machineryFormData = useLoansStore((state) => state.machineryFormData);
  const msmeFormData = useLoansStore((state) => state.msmeFormData);
  const categoryId = useLoansStore((state) => state.selectedCategory?.id);

  const loan = useMemo(
    () =>
      getSubmittedLoanSummary(
        categoryId,
        businessFormData,
        personalFormData.loanAmount,
        propertyFormData.requestedAmount,
        homeLoanFormData.loanAmount || homeLoanFormData.requestedAmount,
        vehicleFormData.requestedLoanAmount,
        machineryFormData.requestedLoanAmount,
        msmeFormData.annualTurnover
      ),
    [
      categoryId,
      businessFormData,
      personalFormData.loanAmount,
      propertyFormData.requestedAmount,
      homeLoanFormData.loanAmount,
      homeLoanFormData.requestedAmount,
      vehicleFormData.requestedLoanAmount,
      machineryFormData.requestedLoanAmount,
      msmeFormData.annualTurnover,
    ]
  );

  const summary = useMemo<ApplicationSummaryRow[]>(
    () => [
      {
        label: categoryId === "msme-loan" ? "Annual Turnover" : "Requested Amount",
        value: loan.amountRaw.trim() ? formatCurrencyINR(loan.amountRaw) : "—",
        icon: "cash-outline",
      },
    ],
    [categoryId, loan.amountRaw]
  );

  return (
    <ApplicationUnderReview
      applicationType={loan.label}
      applicationReference={applicationId}
      submittedAt={submittedAt}
      summary={summary}
      status="under_review"
      referenceNote={isSynced ? undefined : UNCONFIRMED_REFERENCE_NOTE}
      onGoHome={onDone}
      supportAction={{ onPress: onContactSupport }}
    />
  );
};

export default LoanUnderReviewScreen;
