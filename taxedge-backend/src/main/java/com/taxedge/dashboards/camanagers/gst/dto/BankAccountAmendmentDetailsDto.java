package com.taxedge.dashboards.camanagers.gst.dto;

import java.time.LocalDateTime;

import com.taxedge.gst.registration.enums.AccountType;
import com.taxedge.gst.registration.enums.RegisterationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankAccountAmendmentDetailsDto {

    // Common Customer Details
    private CustomerDetailsDto customer;

    // Bank Account Amendment Details
    private String id;
    private String gstNumber;
    private String newBankName;
    private String newBankAccountNumber;
    private String newIfscCode;
    private AccountType newAccountType;
    private byte[] imageData;
    private RegisterationStatus status;
    private LocalDateTime submittedAt;
}
