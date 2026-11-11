package com.taxedge.myapplications.itr.tdsrefund.dto;

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
public class TdsRefundMyApplicationResponseDto {

    // Essential identification, status, and dates
    private String tdsRefundId;
    private String applicationType;
    private RegisterationStatus status;
    private Long assignedAgentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime submittedAt;

    // Display identifier
    private String businessPan;

    // Document flags from documents table
    private boolean businessPanDocumentUploaded;
    private boolean aadhaarDocumentUploaded;
}
