package com.taxedge.myapplications.gst.gstregistration.dto;

import java.time.LocalDateTime;

import com.taxedge.gst.registration.enums.PrincipalPlaceAddressType;
import com.taxedge.gst.registration.enums.RegisterationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyApplicationResponseDto {

    // Only essential status and date metadata from Business table
    private String gstId;
    private String applicationType;
    private RegisterationStatus status;
    private Long assignedAgentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime submittedAt;

    // Document flags and type from Documents table
    private String documentId;
    private PrincipalPlaceAddressType principalPlaceAddressType;
    private boolean panCardUploaded;
    private boolean aadhaarCardUploaded;
    private boolean businessRegistrationProofUploaded;
    private boolean principalPlaceAddressProofUploaded;
    private boolean bankPassbookOrCancelledChequeUploaded;
    private boolean passportSizePhotographUploaded;
}
