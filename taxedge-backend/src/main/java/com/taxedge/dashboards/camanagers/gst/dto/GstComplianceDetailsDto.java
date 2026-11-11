package com.taxedge.dashboards.camanagers.gst.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.taxedge.gst.compliance.enums.ComplianceRequestType;
import com.taxedge.gst.registration.enums.RegisterationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GstComplianceDetailsDto {

    // Common Customer Details
    private CustomerDetailsDto customer;

    // Compliance Details
    private String complianceId;
    private String gstin;
    private String financialYear;
    private ComplianceRequestType requestType;
    private String gstr2bNumber;
    private byte[] reconciliationFile1;
    private byte[] reconciliationFile2;
    private String noticeNumber;
    private LocalDate noticeIssueDate;
    private LocalDate replyDueDate;
    private byte[] noticeFile;
    private String message;
    private RegisterationStatus status;
    private LocalDateTime submittedAt;
}

