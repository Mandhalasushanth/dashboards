package com.taxedge.dashboards.camanagers.itr.dto;

import java.time.LocalDateTime;

import com.taxedge.dashboards.camanagers.gst.dto.CustomerDetailsDto;
import com.taxedge.gst.registration.enums.RegisterationStatus;
import com.taxedge.itr.reviseditr.enums.RevisionReason;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevisedItrApplicationDetailsDto {

    // Common Customer Details
    private CustomerDetailsDto customer;

    // Step 1: Revised ITR Basic Details (RevisedItr)
    private String revisedItrId;
    private String itrAcknowledgementNumber;
    private String assessmentYear;
    private RegisterationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime submittedAt;

    // Step 2: Revised ITR Financial Details (RevisedItrDetails)
    private String detailsId;
    private String salaryBusinessIncome;
    private String otherIncome;
    private String deduction80C;
    private String deduction80D;
    private String homeLoanInterest;
    private String taxableIncome;
    private String bankAccountForRefund;
    private String ifscCode;

    // Step 3: Revision Reason (RevisionReasonEntity)
    private String revisionReasonId;
    private RevisionReason reason;
    private String otherReason;

    // Step 4: Revised ITR Documents (RevisedItrDocument)
    private String documentId;
    private byte[] panCard;
    private byte[] aadhaarCard;
    private byte[] form16Form16A;
    private byte[] aisTisStatement;
    private byte[] bankStatements;
    private byte[] investmentProofs;
}

