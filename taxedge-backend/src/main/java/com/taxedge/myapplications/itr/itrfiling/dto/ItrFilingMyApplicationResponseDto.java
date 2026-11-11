package com.taxedge.myapplications.itr.itrfiling.dto;

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
public class ItrFilingMyApplicationResponseDto {

    // Essential identification, status, and dates
    private String itrId;
    private String applicationType;
    private RegisterationStatus status;
    private Long assignedAgentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime submittedAt;

    // Display identifier
    private String assessmentYear;

    // Document flags from documents table
    private boolean form16Uploaded;
    private boolean form26asUploaded;
    private boolean aisTisUploaded;
    private boolean bankAccountStatementUploaded;
    private boolean salaryPayslipsUploaded;
}
