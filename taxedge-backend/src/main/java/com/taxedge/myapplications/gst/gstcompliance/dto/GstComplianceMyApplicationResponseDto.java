package com.taxedge.myapplications.gst.gstcompliance.dto;

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
public class GstComplianceMyApplicationResponseDto {

    private String complianceId;
    private String gstin;
    private String applicationType;
    private RegisterationStatus status;
    private Long assignedAgentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime submittedAt;

    private String financialYear;
    private ComplianceRequestType requestType;
    private String gstr2bNumber;
    private String noticeNumber;
    private LocalDate noticeIssueDate;
    private LocalDate replyDueDate;
    private String message;

    // Document upload flags (bytes excluded)
    private boolean reconciliationFile1Uploaded;
    private boolean reconciliationFile2Uploaded;
    private boolean noticeFileUploaded;
}
