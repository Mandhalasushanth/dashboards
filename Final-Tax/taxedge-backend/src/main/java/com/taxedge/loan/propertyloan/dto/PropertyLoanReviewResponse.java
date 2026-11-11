package com.taxedge.loan.propertyloan.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.taxedge.loan.personalloan.enums.LoanApplicationStatus;
import com.taxedge.loan.propertyloan.enums.ConstructionStage;
import com.taxedge.loan.propertyloan.enums.PropertyLoanPurpose;
import com.taxedge.loan.propertyloan.enums.PropertyOwnership;
import com.taxedge.loan.propertyloan.enums.PropertyStatus;
import com.taxedge.loan.propertyloan.enums.PropertyType;
import com.taxedge.loan.propertyloan.enums.RenovationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyLoanReviewResponse {

    private String id;
    private LoanApplicationStatus status;

    private ApplicantDetails applicantDetails;
    private LoanRequirement loanRequirement;
    private PropertyDetails propertyDetails;
    private DocumentSummary documents;
    private boolean declarationConfirmed;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ApplicantDetails {
        private String custId;
        private String fullName;
        private String mobileNumber;
        private String email;
        private String pan;
        private String aadhaar;
        private LocalDate dob;
        private String currentAddress;
        private String permanentAddress;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoanRequirement {
        private String loanType; // "PROPERTY_LOAN"
        private BigDecimal requestedLoanAmount;
        private PropertyLoanPurpose purposeOfLoan;
        private String purposeOther;

        // Conditional fields:
        private PropertyStatus propertyStatus;
        private ConstructionStage constructionStage;
        private RenovationStatus renovationStatus;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PropertyDetails {
        private PropertyType propertyType;
        private String city;
        private String state;
        private String pinCode;
        private PropertyOwnership ownership;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DocumentSummary {
        private int requiredCount;
        private int uploadedRequiredCount;
        private List<PropertyLoanDocumentItemResponse> checklist;
    }
}
