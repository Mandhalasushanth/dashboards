package com.taxedge.dashboards.camanagers.itr.dto;

import java.time.LocalDateTime;

import com.taxedge.dashboards.camanagers.gst.dto.CustomerDetailsDto;
import com.taxedge.gst.registration.enums.RegisterationStatus;
import com.taxedge.itr.tdsrefund.enums.AccountType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TdsRefundDetailsDto {

    // Common Customer Details
    private CustomerDetailsDto customer;

    // TDS Refund Details
    private String id;
    private String custId;
    private String accountHolderName;
    private String accountNumber;
    private String ifscCode;
    private String bankName;
    private String branchName;
    private AccountType accountType;
    private String legalBusinessName;
    private String businessPan;
    private byte[] businessPanDocument;
    private String aadhaarNumber;
    private byte[] aadhaarDocument;
    private String mobileNumber;
    private RegisterationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime submittedAt;
}

