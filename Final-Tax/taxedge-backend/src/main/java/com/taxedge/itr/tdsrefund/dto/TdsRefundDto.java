package com.taxedge.itr.tdsrefund.dto;

import java.time.LocalDateTime;

import com.taxedge.itr.tdsrefund.enums.AccountType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TdsRefundDto {

    private String id;

    @NotBlank(message = "Legal name of business is required")
    private String legalBusinessName;

    @NotBlank(message = "Business PAN is required")
    private String businessPan;

    private byte[] businessPanDocument;

    @NotBlank(message = "Aadhaar number is required")
    private String aadhaarNumber;

    private byte[] aadhaarDocument;

    @NotBlank(message = "Mobile number is required")
    private String mobileNumber;

    @NotBlank(message = "Account holder name is required")
    private String accountHolderName;

    @NotBlank(message = "Account number is required")
    private String accountNumber;

    @NotBlank(message = "IFSC code is required")
    private String ifscCode;

    private String bankName;

    private String branchName;

    @NotNull(message = "Account type is required")
    private AccountType accountType;

    private LocalDateTime createdAt;
}
