package com.taxedge.myapplications.itr.reviseditr.dto;

import java.time.LocalDateTime;

import com.taxedge.gst.registration.enums.RegisterationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevisedItrMyApplicationResponseDto {

    // Essential identification, status, and dates
    private String revisedItrId;
    private String applicationType;
    private RegisterationStatus status;
    private Long assignedAgentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime submittedAt;

    // Display identifiers
    private String assessmentYear;
    private String itrAcknowledgementNumber;

    // Document flags from documents table
    private boolean panCardUploaded;
    private boolean aadhaarCardUploaded;
    private boolean form16Uploaded;
    private boolean aisTisStatementUploaded;
    private boolean bankStatementsUploaded;
}
