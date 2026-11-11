package com.taxedge.myapplications.gst.gstamendment.dto;

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
public class GstAmendmentMyApplicationResponseDto {

    private String amendmentId;
    private String gstNumber;
    private String section;
    private String applicationType;
    private RegisterationStatus status;
    private Long assignedAgentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime submittedAt;

    // Amended summary description or value
    private String description;
    private String amendedValue;
    private boolean proofDocumentUploaded;
}
