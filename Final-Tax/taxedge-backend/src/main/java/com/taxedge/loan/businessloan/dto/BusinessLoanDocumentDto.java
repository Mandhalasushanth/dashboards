package com.taxedge.loan.businessloan.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessLoanDocumentDto {

    private Long id;

    private String loanApplicationId;

    private byte[] panCardFile;
    private byte[] aadhaarCardFile;
    private byte[] kycDirectorsFile;
    private byte[] businessAddressProofFile;
    private byte[] bankStatementsFile;
    private byte[] gstCertificateFile;
    private byte[] gstReturnsFile;
    private byte[] businessItrFile;
    private byte[] auditedBalanceSheetFile;
    private byte[] profitLossStatementFile;
    private byte[] cashFlowStatementFile;
    private byte[] udyamCertificateFile;
    private byte[] businessRegistrationProofFile;
    private byte[] businessExpansionDocumentFile;

    private LocalDateTime createdAt;
}
