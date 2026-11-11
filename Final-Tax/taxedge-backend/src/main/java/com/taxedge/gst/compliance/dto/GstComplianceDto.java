package com.taxedge.gst.compliance.dto;

import java.time.LocalDate;

import com.taxedge.gst.compliance.enums.ComplianceRequestType;
import com.taxedge.gst.registration.enums.RegisterationStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GstComplianceDto {

    @NotBlank(message = "GSTIN is required")
    private String gstin;

    @NotBlank(message = "Customer ID is required")
    private String customerId;

    @NotBlank(message = "Financial year is required")
    private String financialYear;

    @NotNull(message = "Request type is required")
    private ComplianceRequestType requestType;

    private String gstr2bNumber;

    private byte[] reconciliationFile1;

    private byte[] reconciliationFile2;

    private String noticeNumber;

    private LocalDate noticeIssueDate;

    private LocalDate replyDueDate;

    private byte[] noticeFile;

    private String message;

    @Builder.Default
    private RegisterationStatus status = RegisterationStatus.DRAFT;
}
